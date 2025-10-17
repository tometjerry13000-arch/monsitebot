const visitorId = Math.random().toString(36).substring(2, 10);

async function notifyPage(page) {
  await fetch("/visit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId, page }),
  });
}

async function listenCommands() {
  const res = await fetch(`/get-command?visitorId=${visitorId}`);
  const data = await res.json();
  if (data.command) {
    window.location.href = `${data.command}.html`;
  }
  setTimeout(listenCommands, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  const page = document.title;
  notifyPage(page);
  listenCommands();
});
