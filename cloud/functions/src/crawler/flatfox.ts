import { Browser, launch, Page } from "puppeteer";

import { PLZ } from "../utils/crawler.utils";

import { FlatData } from "../model/flat";

import { JSDOM } from "jsdom";

export async function crawlFlatfox(): Promise<FlatData[] | undefined> {
  const browser: Browser = await launch({ args: ["--no-sandbox"] });

  const page: Page = await browser.newPage();
  await page.setViewport({ width: 960, height: 768 });

  await goToWohnung(page);
  const elements: FlatData[] | undefined = await findElements(page);

  console.log(elements);

  return elements;
}

async function goToWohnung(page: Page) {
  let url: string = `https://flatfox.ch/de/search/?east=8.577691901762364&is_furnished=false&is_temporary=false&max_price=2000&min_floor=1&min_price=1500&north=47.41205703605036&object_category=APARTMENT&ordering=-insertion&query=Zurich&south=47.341263892423434&west=8.497327555258153`;

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
    [...document.querySelectorAll("div.flat-thumb")].map(a => a.outerHTML)
  );

  if (!elements || elements.length <= 0) {
    return undefined;
  }

  const results: FlatData[] = elements
    .filter((element: string) => {
      const dom = new JSDOM(`<!DOCTYPE html><div>${element}</div>`);

      return filterPlz(dom);
    })
    .map((element: string) => {
      const dom = new JSDOM(`<!DOCTYPE html><div>${element}</div>`);

      const link = dom.window.document.querySelector("div > a");
      const imageElement = dom.window.document.querySelector(
        "div.listing-image > img"
      );
      const title = dom.window.document.querySelector("h2");
      const location = dom.window.document.querySelector(
        "span.flat-thumb-title__location"
      );
      const priceElement = dom.window.document.querySelector("span.price");

      const price: number =
        priceElement && priceElement.textContent
          ? parseFloat(priceElement.textContent.replace("’", ""))
          : 0;

      const image: string | null =
        imageElement && imageElement.hasAttribute("src")
          ? `https://flatfox.ch${imageElement.getAttribute("src")}`
          : null;

      const url: string | null =
        link && link.hasAttribute("href")
          ? `https://flatfox.ch${link.getAttribute("href")}`
          : null;

      let rooms: number = 0;
      if (title && title.textContent) {
        const split: string[] = title.textContent.split(" ");
        if (split && split.length > 0) {
          rooms =
            parseFloat(split[0]) +
            (title.textContent.indexOf("½") > -1 ? 0.5 : 0);
        }
      }

      if (title) {
        const span = title.querySelector("span.flat-thumb-title__location");

        if (span && span.parentElement) {
          span.parentElement.removeChild(span);
        }
      }

      return {
        url: url,
        image_url: image,
        title:
          title && title.textContent
            ? title.textContent.replace("\n", "").trim()
            : null,
        location:
          location && location.textContent ? location.textContent.trim() : null,
        rooms: rooms,
        price: price,
        published_at: new Date(),
        source: "flatfox"
      } as FlatData;
    });

  return results;
}

function filterPlz(dom: JSDOM): boolean {
  const location = dom.window.document.querySelector(
    "span.flat-thumb-title__location"
  );

  if (!location || !location.textContent) {
    return false;
  }

  const plz: number = parseInt(
    location.textContent.trim().replace(/[^0-9]/g, "")
  );

  return PLZ.indexOf(plz) >= 0;
}

// Uncomment to run the function locally

// (async () => {
//     try {
//         await crawlFlatfox();
//     } catch (e) {
//         // Deal with the fact the chain failed
//     }
// })();
