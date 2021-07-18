const fs = require("fs");
const path = require("path");

//send oldUrl, name of the directory , req.headers.host
exports.ImageRemover = (oldUrl, directoryName, hostHeader) => {
  let oldUrlName;
  if (oldUrl !== "" && oldUrl.includes(hostHeader)) {
    const completeOldUrl = oldUrl.replace(/\\/g, "/");
    const oldArray = completeOldUrl.split("/");
    const oldLength = oldArray.length;
    oldUrlName = oldArray[oldLength - 1];
    // console.log(process.cwd(), "HEOKU LAI");
    const oldDirectory = `${process.cwd()}/uploads/${directoryName}/${oldUrlName}`;
    const oldExists = fs.existsSync(oldDirectory);
    console.log(oldExists)
    if (oldExists) {
      fs.unlinkSync(oldDirectory);
    }
  }
};
