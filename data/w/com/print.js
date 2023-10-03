function print(obj) {
    if (!$("run_console")){
      var con = document.createElement("div");
      con.setAttribute("id", "run_console");
      $("run_windows").appendChild(con);
    }
    run_console = $("run_console");
    run_console.innerText += String(obj) + "\n";
    run_console.scrollTop = run_console.scrollHeight;
    return;
}