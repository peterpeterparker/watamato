import { Browser, launch, Page } from "puppeteer";

import { JSDOM } from "jsdom";

import { FlatData } from "../model/flat";

import { PLZ, plzUrl } from "../utils/crawler.utils";

export async function crawlHomegate(): Promise<FlatData[] | undefined> {
  const browser: Browser = await launch({ args: ["--no-sandbox"] });

  const page: Page = await browser.newPage();
  await page.setViewport({ width: 960, height: 768 });

  await goToWohnung(page, 1);
  const elementsPage1: FlatData[] | undefined = await findElements(page);

  await goToWohnung(page, 2);
  const elementsPage2: FlatData[] | undefined = await findElements(page);

  await browser.close();

  return elementsPage1 !== undefined
    ? elementsPage2
      ? [...elementsPage2, ...elementsPage1]
      : elementsPage1
    : elementsPage2;
}

async function goToWohnung(page: Page, index: number) {
  let url: string = `https://www.homegate.ch/mieten/wohnung/trefferliste?o=dateCreated-desc&loc=${plzUrl()}&ag=1400&ah=2000`;

  if (index > 1) {
    url += `&ep=${index}`;
  }

  await page.goto(url, {
    waitUntil: "networkidle0",
    timeout: 10000
  });

  await (page as any)._client.send("ServiceWorker.enable");
  await (page as any)._client.send("ServiceWorker.stopAllWorkers");

  // await page.waitForFunction('document.querySelector("div#user-section-registration")');

  // await page.waitForNavigation();
}

async function findElements(page: Page): Promise<FlatData[] | undefined> {
  page.on("console", consoleObj => console.log(consoleObj.text()));

  const elements: string[] = await page.evaluate(() =>
    [...document.querySelectorAll('a[data-test="result-list-item"')].map(
      a => a.outerHTML
    )
  );

  if (!elements || elements.length <= 0) {
    return undefined;
  }

  const results: FlatData[] = elements
    .filter((element: string) => {
      const dom = new JSDOM(`<!DOCTYPE html><div>${element}</div>`);

      const priceElement = dom.window.document.querySelector(
        'span[class*="ListingPriceSimple_price"] span:not([class*="ListingPriceSimple_currency"])'
      );

      return priceElement !== undefined && filterPlz(dom);
    })
    .map((element: string) => {
      const dom = new JSDOM(`<!DOCTYPE html><div>${element}</div>`);

      const link = dom.window.document.querySelector("div > a");
      const image = dom.window.document.querySelector(
        'div[class*="ResultlistItemImage"] > img'
      );
      const title = dom.window.document.querySelector(
        'div[class*="DescriptionSimple_description"] > p'
      );
      const location = dom.window.document.querySelector(
        'span[class*="AddressData_address"]'
      );
      const rooms = dom.window.document.querySelector(
        'span[class*="RoomNumber_value"]'
      );
      const priceElement = dom.window.document.querySelector(
        'span[class*="ListingPriceSimple_price"] span:not([class*="ListingPriceSimple_currency"])'
      );

      if (rooms) {
        const label = rooms.querySelector('span[class*="RoomNumber_label"]');

        if (label && label.parentElement) {
          label.parentElement.removeChild(label);
        }
      }

      const price: number =
        priceElement && priceElement.textContent
          ? parseFloat(
              priceElement.textContent.replace("’", "").replace(".–", "")
            )
          : 0;

      const url: string | null =
        link && link.hasAttribute("href")
          ? `https://www.homegate.ch/${link.getAttribute("href")}`
          : null;

      return {
        url: url,
        image_url: image ? image.getAttribute("src") : null,
        title:
          title && title.textContent
            ? title.textContent.replace("\n", "").trim()
            : null,
        location:
          location && location.textContent ? location.textContent.trim() : null,
        rooms:
          rooms && rooms.textContent ? parseFloat(rooms.textContent.trim()) : 0,
        price: price,
        published_at: new Date(),
        source: "homegate"
      } as FlatData;
    });

  return results;
}

// Even if the user filter the query, still not related PLZ are delivered
function filterPlz(dom: JSDOM): boolean {
  const location = dom.window.document.querySelector(
    'span[class*="AddressData_address"]'
  );

  if (!location || !location.textContent) {
    return false;
  }

  const info: string[] | null = location.textContent.split(", ");

  if (!info || info.length <= 0) {
    return false;
  }

  const plz: number = parseInt(
    info[info.length > 1 ? 1 : 0].trim().replace(/[^0-9]/g, "")
  );

  return PLZ.indexOf(plz) >= 0;
}

// Uncomment to run the function locally

// (async () => {
//     try {
//         await crawlHomegate();
//     } catch (e) {
//         // Deal with the fact the chain failed
//     }
// })();
