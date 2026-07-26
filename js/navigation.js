function goToPage(page) {
  const school =
    new URLSearchParams(window.location.search).get("school") ||
    sessionStorage.getItem("school") ||
    "pleasanthill";

  sessionStorage.setItem("school", school);

  window.location.href = page + "?school=" + school;
}
