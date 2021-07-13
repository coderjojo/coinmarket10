const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

async function getPrice() {
    try {
        const siteUrl = "https://coinmarketcap.com/";
        const { data } = await axios({
            method: "GET",
            url: siteUrl,
        });

        const coin = [
            "rank",
            "name",
            "price",
            "24hr",
            "7days",
            "marketCap",
            "volume",
            "circulatingSupply",
        ];
        const coinArray = [];

        const $ = cheerio.load(data);
        const pageSelector =
            "#__next > div > div.sc-fzqARJ.eLpUJW.cmc-body-wrapper > div > div > div.tableWrapper___3utdq.cmc-table-homepage-wrapper___22rL4 > table > tbody > tr";

        $(pageSelector).each((parentIdx, parentElem) => {
            let key = 0;
            const coinObj = {};
            if (parentIdx < 10) {
                $(parentElem)
                    .children()
                    .each((childIdx, childElem) => {
                        let tdVal = $(childElem).text();

                        if (key === 1 || key === 6) {
                            tdVal = $(
                                "p:first-child",
                                $(childElem).html()
                            ).text();
                        }
                        if (tdVal) {
                            coinObj[coin[key]] = tdVal;
                            key++;
                        }
                    });
                coinArray.push(coinObj);
            }
        });
        return coinArray;
    } catch (err) {
        console.log(err);
    }
}

const app = express();

app.get("/api/price", async (req, res) => {
    try {
        const priceFeed = await getPrice();
        console.log(priceFeed);
        return res.status(200).json({
            result: priceFeed,
        });
    } catch (err) {
        return res.status(500).json({
            err: err.toString(),
        });
    }
});

app.listen(3000, () => {
    console.log("Running on port 3000");
});
