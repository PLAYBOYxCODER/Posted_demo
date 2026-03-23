const mammoth = require("mammoth");
const fs = require("fs");

mammoth.extractRawText({path: "c:/Users/Sai/MINE/PROJECTS/Clients/Poster_store/Assets/TEMPLATES/ORDER PLACE.docx"})
    .then(function(result){
        fs.writeFileSync("order_place_text.txt", result.value);
        console.log("Extracted ORDER PLACE");
    })
    .done();

mammoth.extractRawText({path: "c:/Users/Sai/MINE/PROJECTS/Clients/Poster_store/Assets/TEMPLATES/Favorites items button.docx"})
    .then(function(result){
        fs.writeFileSync("fav_button_text.txt", result.value);
        console.log("Extracted Favorites");
    })
    .done();
