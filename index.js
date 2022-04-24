const axios = require("axios").default, cheerio = require("cheerio"), express = require("express")

// this functions scrapes profile of provided username
async function scrap(name){
    let user = {}
    let data
    try { data = (await axios.get(`https://github.com/${name}`)).data } 
    catch (err) { (err.response.status === 404) ? user.error = "404 (user not found)" : ""; return user }
    let $ = cheerio.load(data)

    user.pfp = $(".js-profile-editable-replace > .clearfix.d-flex.d-md-block.flex-items-center.mb-4.mb-md-0 > .position-relative.d-inline-block.col-2.col-md-12.mr-3.mr-md-0.flex-shrink-0 > a > img").attr("src")
    user.name = $(".vcard-names-container.float-left.js-profile-editable-names.col-12.py-3.js-sticky.js-user-profile-sticky-fields > .vcard-names > .p-name.vcard-fullname.d-block.overflow-hidden").text().trim() || "none"
    user.username = $(".vcard-names-container.float-left.js-profile-editable-names.col-12.py-3.js-sticky.js-user-profile-sticky-fields > .vcard-names > .p-nickname.vcard-username.d-block").text().trim()
    user.interaction = {
        followers: parseInt($(".js-profile-editable-replace > .d-flex.flex-column > .js-profile-editable-area.d-flex.flex-column.d-md-block > .flex-order-1.flex-md-order-none.mt-2.mt-md-0 > .mb-3 > a").eq(0).find(".text-bold.color-fg-default").text()),
        following: parseInt($(".js-profile-editable-replace > .d-flex.flex-column > .js-profile-editable-area.d-flex.flex-column.d-md-block > .flex-order-1.flex-md-order-none.mt-2.mt-md-0 > .mb-3 > a").eq(1).find(".text-bold.color-fg-default").text())
    }
    user.company = $(".js-profile-editable-replace > .d-flex.flex-column > .js-profile-editable-area.d-flex.flex-column.d-md-block > .vcard-details > li").eq(0).find(".p-org").text() || "none"
    user.location = $(".js-profile-editable-replace > .d-flex.flex-column > .js-profile-editable-area.d-flex.flex-column.d-md-block > .vcard-details > li").eq(1).find(".p-label").text() || "none"
    user.website = $(".js-profile-editable-replace > .d-flex.flex-column > .js-profile-editable-area.d-flex.flex-column.d-md-block > .vcard-details > li").eq(2).find("a").text() || "none"

    return user
}

// tis function sends scrapped data to web
function init(){
    const app = express()
    app.get("/", (req, res) => { res.send(`usage: ${req.protocol}://${req.get("host")}/github_username`) })
    app.get("/:username", async (req, res) => {
        res.send(await scrap(req.params.username))
    })
    
    app.listen(6969, () => { console.log("Initiated") })
}; init()