const apiKey = 'AIzaSyDvwEBgefWlt2sxG4n-uELocbJmHp5u4gI';
async function run() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const resp = await fetch(url);
        const data = await resp.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
run();
