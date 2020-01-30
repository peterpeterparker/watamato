<div align="center">
  <a href="https://tietracker.com"><img src="app/src/assets/img/logo.svg" alt="Watamato logo" height="160"></a>
  
  <br/>
  
  <p><strong>Watamato</strong> - A Trello look alike board for my flat hunting in Zürich.️</p>
  
  <br/>
  
  ![Website](https://img.shields.io/website?label=Progressive%20Web%20Apps&url=https%3A%2F%2Fwatamato.com)
  [![GitHub release](https://img.shields.io/github/release/peterpeterparker/watamato/all?logo=GitHub)](https://github.com/peterpeterparker/watamato/releases/latest)
  [![Tweet](https://img.shields.io/twitter/url?url=https%3A%2F%watamato.com)](https://twitter.com/intent/tweet?url=https%3A%2F%2Fwatamato.com&text=A+%40Trello+look+alike+board+for+%40daviddalbusco+flat+hunting+in+Z%C3%BCrich)
</div>

## Table of contents

- [Getting Started](#getting-started)
- [Features](#features)
- [Technical Stack](#technical-stack)
- [Run Locally](#run-locally)
- [License](#license)

## Getting Started

Once again I have to find a new place to live in Zürich City and therefore once again I have to use search engines and platforms to browse flats, that were, at least to my eyes, never upgraded in terms of UX and even sometimes design, since the ’90s 🙈.

Sunday morning, while I was about to visit such websites, I realize that there are no ways to me to undergo the frustration of using these for weeks or months, again 😤.

That's why I've created in a couple of days this prototype to help me solve my problem.

Btw. I'm still looking for a new apartment in town. If you have any tips or looking for someone to takeover your rent, ping me 🙏.

## Features

A Trello look alike board automatically updated with incoming flat opportunities from the housing online market.

Currently there are no filter available. It's a personal projects and therefore they are applied at the source with my matching expectations.

But hey, it's open source, pull requests are welcome 😁.

## Technical Stack

This app is developed with [Ionic](https://ionicframework.com) and [Angular](https://angular.io).

It uses the [Google Cloud Firestore](https://cloud.google.com/firestore/) and the content is gathered with the help of [Puppeteer](https://github.com/puppeteer/puppeteer).

## Run Locally

To develop and run this documentation locally, proceed as following:

```
git clone https://github.com/peterpeterparker/watamato
cd watamato/app/
npm install
ionic serve
```

## License

This application is released under the GNU Affero General Public License. Copyright [David Dal Busco](mailto:david.dalbusco@outlook.com). See [COPYING](./COPYING) for more details.

[watamato]: https://watamato.com
