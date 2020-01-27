import * as functions from 'firebase-functions';

import {Browser, launch, Page} from 'puppeteer';

import {JSDOM} from 'jsdom';

import {FlatData} from '../model/flat';

export async function crawlRonorp(): Promise<FlatData[] | undefined> {
    const browser: Browser = await launch({args: ['--no-sandbox']});

    const page: Page = await browser.newPage();
    await page.setViewport({width: 768, height: 768});

    await goHomepage(page);
    await goLogin(page);
    await goToWohnung(page);
    await filterSearch(page);

    let elements: FlatData[] | undefined = await findElements(page);

    // There might be some flats on next page
    // We don't iterate further, that should be enough according the search limitation
    if (allElementsPublishedToday(elements)) {
        try {
            const index: number = 2;
            await page.waitForSelector(`a[data-value="${index}"]`, {timeout: 500});

            await goNextPage(page, 2);

            const nextElements: FlatData[] | undefined = await findElements(page);

            if (nextElements !== undefined && nextElements.length > 0) {
                elements = [...elements as FlatData[], ...nextElements];
            }
        } catch (error) {
            // There is nothing to paginate, all results are on first page
        }
    }

    await browser.close();

    return elements;
}

function allElementsPublishedToday(elements: FlatData[] | undefined): boolean {
    if (!elements || elements === undefined || elements.length <= 0) {
        return true;
    }

    const today: Date = new Date();
    const notTodayElements: FlatData[] = elements.filter((element: FlatData) => {
        return element.published_at.getDate() !== today.getDate() ||
            element.published_at.getMonth() !== today.getMonth() ||
            element.published_at.getFullYear() !== today.getFullYear()
    });

    return (!notTodayElements || notTodayElements.length <= 0);
}

async function goNextPage(page: Page, index: number) {
    await page.evaluate((selector) => document.querySelector(selector).click(), `a[data-value="${index}"]`);

    await page.waitForNavigation({
        waitUntil: 'networkidle0',
    });
}

async function findElements(page: Page): Promise<FlatData[] | undefined> {
    await autoScroll(page, new Date());

    page.on('console', consoleObj => console.log(consoleObj.text()));

    const elements: string[] = await page.evaluate(() => [...document.querySelectorAll('div.short_advert.inserate')].map(div => div.innerHTML));

    if (!elements || elements.length <= 0) {
        return undefined;
    }

    // TODO: Filter either more recent than time or later check if key already exists

    const results: FlatData[] = elements.filter((element: string) => {
        const dom = new JSDOM(`<!DOCTYPE html><div>${element}</div>`);
        // const dateChild = dom.window.document.querySelector('div.user div.pull-left');

        const link = dom.window.document.querySelector('a.image-wrapper');

        // TODO filterPLZ and date -> reactivate
        // return link && filterPlz(dom) && dateChild && dateChild.innerHTML.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/g);
        return link !== undefined;

        // Match a date example
        // return dateChild && dateChild.innerHTML.match(/^([0-2][0-9]|(3)[0-1])(\.)(((0)[0-9])|((1)[0-2]))(\.)\d{4}$/g)
    }).map((element: string) => {
        const dom = new JSDOM(`<!DOCTYPE html><div>${element}</div>`);

        const time = dom.window.document.querySelector('div.user div.pull-left');
        const link = dom.window.document.querySelector('a.image-wrapper');
        const image = dom.window.document.querySelector('a.image-wrapper > img');
        const title = dom.window.document.querySelector('.title_comment');
        const content = dom.window.document.querySelector('div.text_content p.special_data');

        const info: string[] | null = content ? content.innerHTML.split('<br>') : null;

        let price: number = 0;
        if (info && info.length > 2 && info[2]) {
            const split: string[] = info[2].trim().split('\n');
            price = split && split.length > 0 ? parseFloat(split[split.length - 1].trim().replace('\'', '')) : 0;
        }

        const today: Date = new Date();
        if (time && time.innerHTML && time.innerHTML.indexOf(':') > -1) {
            today.setHours(parseInt(time.innerHTML.split(':')[0]));
            today.setMinutes(parseInt(time.innerHTML.split(':')[1]));
        } else if (time && time.innerHTML && time.innerHTML.indexOf('.') > -1) {
            today.setDate(parseInt(time.innerHTML.split('.')[0]));
            today.setMonth(parseInt(time.innerHTML.split('.')[1]));
        }

        let url: string | null = null;
        if (link && link.getAttribute('href')) {
            const fullUrl: URL = new URL(link.getAttribute('href') as string);
            url = fullUrl.origin + fullUrl.pathname;
        }

        return {
            url: url,
            image_url: image ? image.getAttribute('data-src') : null,
            title: title && title.textContent ? title.textContent.replace('\n', '').trim() : null,
            location: info && info.length > 0 && info[0] ? info[0].replace('Ort:', '').trim() : null,
            rooms: info && info.length > 1 && info[1] ? parseFloat(info[1].replace('Zimmer:', '').trim()) : 0,
            price: price,
            published_at: today
        }
    });

    return results;
}

// TODO rm export
export function filterPlz(dom: JSDOM): boolean {
    const content = dom.window.document.querySelector('div.text_content p.special_data');

    if (!content) {
        return false;
    }

    const info: string[] | null = content ? content.innerHTML.split('<br>') : null;

    if (!info || info.length <= 0 || !info[0] || info[0].trim() === '') {
        return false;
    }

    const fullLocation: string = info[0].replace('Ort:', '').trim();

    if (!fullLocation || fullLocation.length < 4) {
        return false;
    }

    const plz: number = parseInt(fullLocation.substring(0, 4));

    return [8000, 8001, 8002, 8003, 8004, 8005, 8006, 8008, 8037, 8032].indexOf(plz) >= 0;
}

async function autoScroll(page: Page, startTime: Date) {
    // We iterate this function to max. 5 seconds, otherwise something doesn't work as expected
    if (Date.now() - startTime.getTime() > 5000) {
        return;
    }

    await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight), {waitUntil: 'networkidle0'});
    await page.waitFor(500);

    const currentPageLink = await page.evaluate(() => document.querySelector('span.pages_links_current'));

    if (!currentPageLink) {
        await autoScroll(page, startTime);
    }
}

async function filterSearch(page: Page) {
    await page.evaluate((selector) => document.querySelector(selector).click(), 'input[name="fdata[advert_type]"][attr_label="Biete"]');

    await page.waitForNavigation({
        waitUntil: 'networkidle0',
    });

    await page.evaluate((selector) => document.querySelector(selector).click(), 'input[name="fdata[sp_realty_type]"][attr_label="Mieten"]');
    await page.evaluate((selector) => document.querySelector(selector).click(), 'input[name="fdata[sp_realty_stadt_agglo]"][attr_label="Stadt"]');
    await page.evaluate((selector) => document.querySelector(selector).click(), 'input[name="fdata[sp_realty_price_from]"][attr_label="1500"]');

    // TODO: Modify max value
    await page.evaluate((selector) => document.querySelector(selector).click(), 'input[name="fdata[sp_realty_price_to]"][attr_label="3000"]');

    await page.evaluate((selector) => document.querySelector(selector).click(), 'a[data-label="FilterButton"]');

    await page.waitForNavigation({
        waitUntil: 'networkidle0',
    });
}

async function goToWohnung(page: Page) {
    await page.goto('https://www.ronorp.net/zuerich/immobilien/wohnung-zuerich.1219/', {
        waitUntil: 'networkidle0',
    });
}

async function goLogin(page: Page) {
    await page.click('#mobile-menu-button');

    // Opening the modal trigger a script which add the form to the DOM
    await page.click('#user-section-registration a');

    // Switch to login respectively not registration
    await page.click("div.btn.btn-default.off");

    const login: string = functions.config().ronorp.login;
    const pwd: string = functions.config().ronorp.pwd;

    await page.type('input#login_login_', login, {delay: 20});
    await page.type('input#login_password_', pwd, {delay: 20});

    await page.click("#submitForm");

    await page.waitForFunction('document.querySelector("span[title=\'caroldanvers\']")');
}

async function goHomepage(page: Page) {
    await page.goto('https://www.ronorp.net/', {
        waitUntil: 'networkidle0',
    });

    await (page as any)._client.send('ServiceWorker.enable');
    await (page as any)._client.send('ServiceWorker.stopAllWorkers');

    // await page.waitForFunction('document.querySelector("div#user-section-registration")');

    // await page.waitForNavigation();
}
