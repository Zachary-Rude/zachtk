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
    input.style.border = "2px solid red";
    errorDiv.textContent = `${response.message}, please try another one!`;
  }
  if (response.type == "success") {
    linkWrapper.style.opacity = 1;
    linkWrapper.style.scale = 1;
    linkWrapper.style.display = "flex";
    shortenedLink.textContent = response.message;
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