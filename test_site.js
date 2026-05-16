const { webkit } = require('playwright');
(async () => {
    const browser = await webkit.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('response', resp => console.log('RESPONSE:', resp.url(), resp.status()));
    await page.goto('https://www.thelistselect.com/');
    await new Promise(r => setTimeout(r, 5000));
    await browser.close();
})();
