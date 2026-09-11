async function inspect() {
  for (const chunk of ["18c6sh2xqqz78.js", "0rj0ms2mgua1s.js"]) {
    const res = await fetch("https://www.acb.com/_next/static/chunks/" + chunk);
    const text = await res.text();
    let idx = 0;
    while ((idx = text.indexOf("api2.acb.com", idx)) !== -1) {
      console.log("Found in", chunk, ":", text.slice(Math.max(0, idx - 100), idx + 200));
      idx += 12;
    }
  }
}
inspect();
