// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// location.href="https://corrently.de/service/quittung.html?embed=true";

const redirectToPrep = async function(e) {
  window.localStorage.setItem("ip_addr",$('#ip_addr').val());
  const prep = await window._getLastFinishedSession($('#ip_addr').val());
  location.href= prep+"&embed=true";
  e.preventDefault();
  return false;
}
$('#btnSub').click(redirectToPrep);
$('#mform').submit(redirectToPrep);

$(document).ready(function() {
  if(window.localStorage.getItem("ip_addr")!==null) {
    $('#ip_addr').val(window.localStorage.getItem("ip_addr"));
  }
});
