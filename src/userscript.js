// ==UserScript==
// @name         MyShows Rutracker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  myshows.me rutracker integration
// @author       You
// @match        https://myshows.me/profile/
// @grant        none
// ==/UserScript==

(function () {
  const SERVER_API_PATH = `https://localhost/api`;

  const SIZE_POSTFIX = ["B", "kB", "MB", "GB", "TB"];

  function formatSize(size) {
    const postfixIndex = Math.floor(Math.log(size) / Math.log(1024));
    const value = (size / Math.pow(1024, i)).toFixed(2) * 1;

    return `${value} ${SIZE_POSTFIX[postfixIndex]}`;
  }

  // for styled-component syntax highlight
  const styled = { el: ([style]) => style };

  // base styles
  const injectStyles = () => {
    const style = document.createElement("style");
    style.innerText = styled.el`
      .play {
        vertical-align: middle;
        margin-top: -10px;
        cursor: pointer;
        font-size: 21px;
        margin-left: -10px;
        position: absolute;
      }

      .play-popup {
        text-align: left;
        z-index: 999;
        padding: 5px;
        background: white;
        position: absolute;
        border: 1px solid gray;
      }

      .episode {
        padding: 2px;
        cursor: pointer;
        display: flex;
        justify-content: flex-end;
      }

      .episode:hover {
        background: gray;
      }
    `;
    document.getElementsByTagName("head")[0].appendChild(style);
  };

  // remove download button
  const removeAudioButtons = () =>
    document
      .querySelectorAll("._download")
      .forEach((n) => n.parentNode.remove());

  const bootstrap = () => {
    removeAudioButtons();
    injectStyles();
  };

  window.watchEpisode = (id) =>
    fetch(`${SERVER_API_PATH}/magnet/${id}`)
      .then((d) => d.json())
      .then((d) => (document.location.href = d.magnet));

  const loadSeries = (name, season, series) => {
    const url = `${SERVER_API_PATH}/search/${name}/${season}/${series}`;
    return fetch(url).then((d) => d.json());
  };

  const numberSort = (a, b) => {
    if (a === b) return 0;
    return a.q > b.q ? -1 : 1;
  };

  const iTextInclude = (quality, text) =>
    quality && quality.toLowerCase().includes(text);

  const getVideoQualityRaring = (video) => {
    let quality = 0;

    if (iTextInclude(video.quality, "2160")) quality += 30;
    if (iTextInclude(video.quality, "1080")) quality += 20;
    if (iTextInclude(video.quality, "720")) quality += 10;
    if (iTextInclude(video.quality, "rip")) quality -= 100;
    if (iTextInclude(video.quality, "bdremux")) quality -= 80;

    return quality;
  };

  const getVideoIcon = (video) => {
    if (iTextInclude(video.quality, "2160")) return "💎";
    if (iTextInclude(video.quality, "1080")) return "🖥";
    if (iTextInclude(video.quality, "720")) return "📼";
    if (iTextInclude(video.quality, "rip")) return "💩";
    return "📺";
  };

  const videoTemplate = (video) => {
    // prettier-ignore
    return `<div class="episode" id="ep-id" onclick="watchEpisode(${video.id})">
      <div style="width: 120px">${video.icon} ${video.quality || "?"}</div>
      <div style="width: 120px">🔊 ${video.audio || "?"}</div>
      <div style="width: 40px">(${video.series.start}-${video.series.end})</div>
      <div style="width: 45px">⬆️${video.seeds}</div>
      <div style="width: 45px">⬇️${video.leeches}</div>
      <div style="width: 75px;">📶${formatSize(video.size)}</div>
    </div>`;
  };

  bootstrap();

  const handlePopupClick = async (popup, name, season, series) => {
    popup.style.display = popup.style.display === "none" ? "block" : "none";

    if (popup.style.display === "block") {
      popup.innerHTML = "⌛ Loading...";
      const data = await loadSeries(name, season, series);

      if (data.error || data.length === 0) {
        popup.innerHTML = "Not found";
        return;
      }

      const content = data
        .map((video) => ({
          ...video,
          qualityRaring: getVideoQualityRaring(video),
        }))
        .sort(numberSort)
        .map((video) => videoTemplate({ ...video, icon: getVideoIcon(video) }))
        .join("");

      popup.innerHTML = content;
    }
  };

  // bind lay icon events
  document.querySelectorAll(".showHeader.fsHeader").forEach((h) => {
    let node = h;
    const name = h.querySelector(".showHeaderName .subHeader").innerText;

    while ((node = node.nextElementSibling) && node.tagName === "DIV") {
      node.querySelectorAll(".bss_seri").forEach((s) => {
        const [season, series] = s.innerText.split("x");
        const node = s.parentNode.lastElementChild;
        node.innerHTML =
          '<div class="play-popup" style="display: none"></div><div class="play">▶️</div>';
        const popup = node.querySelector(".play-popup");

        node.addEventListener("click", () =>
          handlePopupClick(popup, name, season, series)
        );
        node.addEventListener("mouseleave", () => {
          popup.style.display = "none";
        });
      });
    }
  });
})();
