const webPush=require("web-push");

const data=webPush.generateVAPIDKeys();



const setupewebPush=()=>{
    webPush.setVapidDetails(
        "mailto:jdjangra124@gmail.com",
        process.env.publicKey,
        process.env.privateKey

    )
    console.log("web Push setup")
}


module.exports={setupewebPush,webPush};