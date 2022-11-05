const form = document.getElementById("form");
const input = document.querySelector("input");
const linkWrapper = document.querySelector(".link-wrapper");
const errorDiv = document.querySelector(".error");

const shortenedLink = document.querySelector(".short-link");

const handleSubmit = async () => {
  let url = document.querySelector("#url").value;
  const response = await fetch("https://zach.tk/link", {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ url }),
  }).then((response) => response.json());

  if (response.type == "failure") {
    input.style.border = "1px solid red";
    errorDiv.style.display = "block";
    errorDiv.textContent = `${response.message}, please try another one!`;
  }
  if (response.type == "success") {
    linkWrapper.style.opacity = 1;
    linkWrapper.style.scale = 1;
    linkWrapper.style.display = "block";
    shortenedLink.textContent = response.message;
    shortenedLink.href = response.message;
    errorDiv.style.display = "none";
    input.style.border = "1px solid #ced4da";
  }
};

const clearFields = () => {
  let url = document.querySelector("#url");
  url.value = '';
  url.addEventListener('focus', () => {
    errorDiv.textContent = '';
  })
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  handleSubmit();
  clearFields();
});
