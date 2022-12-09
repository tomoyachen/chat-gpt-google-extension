import MarkdownIt from "markdown-it";
import Browser from "webextension-polyfill";

async function run(question) {
  const markdown = new MarkdownIt();

  const container = document.createElement("div");
  container.className = "chat-gpt-container";
  container.innerHTML = '<p class="loading">Waiting for ChatGPT response...</p>';
  // container.style.backgroundColor = '#fffffff0' 

    const siderbarContainer = document.getElementById("rhs");
    if (siderbarContainer) {
      siderbarContainer.prepend(container);
    } else {
      // container.classList.add("sidebar-free");
      // document.getElementById("rcnt").appendChild(container);

      const custom_rhs = document.createElement("div"); 
      custom_rhs.id = "rhs";
      custom_rhs.prepend(container);

      if (['google.com', 'www.google.com'].indexOf(location.host) > -1) {
        document.getElementById("rcnt").appendChild(custom_rhs);
      }else{
        custom_rhs.style.cssText = "position: fixed; z-index: 9999; top: 50px; right: 50px; width: 369px;"
        document.body.appendChild(custom_rhs);
        
      }
    }


  const port = Browser.runtime.connect();
  port.onMessage.addListener(function (msg) {
    if (msg.answer) {
      container.innerHTML =
        '<p class="prefix">ChatGPT:</p><div id="answer" class="markdown-body" dir="auto"></div>';
      container.querySelector("#answer").innerHTML = markdown.render(msg.answer);
    } else if (msg.error === "UNAUTHORIZED") {
      container.innerHTML =
        '<p>Please login at <a href="https://chat.openai.com" target="_blank">chat.openai.com</a> first</p>';
    } else if (!container.innerHTML){
      container.innerHTML = "<p>Failed to load response from ChatGPT</p>";
    }
  });
  port.postMessage({ question });

}

Browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.question) {
    run(message.question)
  }
});

const searchInput = document.getElementsByName("q")[0];
if (searchInput && searchInput.value) {
  // only run on first page
  const startParam = new URL(location.href).searchParams.get("start") || "0";
  if (startParam === "0") {
    run(searchInput.value);
  }
}
