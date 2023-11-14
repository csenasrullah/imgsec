const enForm = document.querySelector("#img-encryption");
const dcForm = document.querySelector("#decrypt-form");
const img = document.querySelector("#img");
const imgD = document.querySelector("#imgD");
const key = document.querySelector("#key");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");

//Encryption LoadImage
function enLoadImage(e) {
  const file = e.target.files[0];

  // Check if file is an image
  if (!isFileImage(file)) {
    alertError("Please select an Image");
    return;
  } else
    alertSuccess("Please Click Start Encryption Below to Encrypt the Image");

  // Show form, image name and output path
  enForm.style.display = "block";
  filename.innerHTML = img.files[0].name;
  outputPath.innerText = path.join(os.homedir(), "imgsec");
}

//Decryption LoadImage
function deLoadImage(e) {
  const file = e.target.files[0];
}

// Make sure file is image
function isFileImage(file) {
  const acceptedImageTypes = ["image/jpg", "image/jpeg", "image/png"];
  return file && acceptedImageTypes.includes(file["type"]);
}

// Encrypt image
function encryptImage(e) {
  e.preventDefault();

  // Electron adds a bunch of extra properties to the file object including the path
  const imgPath = img.files[0].path;

  ipcRenderer.send("image:encrypt", {
    imgPath,
  });
}

function decryptImage(e) {
  e.preventDefault();

  // Electron adds a bunch of extra properties to the file object including the path
  const imgPath = imgD.files[0].path;
  const keyPath = key.files[0].path;

  ipcRenderer.send("image:decrypt", {
    imgPath,
    keyPath,
  });
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 2000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 3500,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  });
}

img.addEventListener("change", enLoadImage);

// enLoadImageD
imgD.addEventListener("change", deLoadImage);

enForm.addEventListener("submit", encryptImage);

//dcForm
dcForm.addEventListener("submit", decryptImage);

//All decrytption process start from here
const decryptBtn = document.getElementById("decryptBtn");
const imageInput = document.getElementById("imageInput");
const textInput = document.getElementById("textInput");
const imgDecryption = document.getElementById("imgDecryption");

decryptBtn.addEventListener("click", () => {

  if(img?.files[0]?.path){
    return ;
  }

  imageInput.classList.toggle("hidden");
  textInput.classList.toggle("hidden");
  imgDecryption.classList.toggle("hidden");
});
