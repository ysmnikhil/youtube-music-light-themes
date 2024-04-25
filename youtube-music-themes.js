// ==UserScript==
// @name         Youtube light themes
// @namespace    http://tampermonkey.net/
// @version      2024-04-25
// @description  Allowed us to see youtube music in light mode
// @author       ysmnikhil
// @match        https://music.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const uLight = {
        count: 0,
        limit: 10,
        currentTheme: 1,
        initStatus: false,
        textBlack: [],
        themes: [
            "#fff",
            "#f1f1f1",
            "#d8b4fe",
            "#a78bfa",
            "#0e7490",
            "#86198f",
            "#94a3b8",
            "#44403c",
            "#f43f5e",
            "#7c3aed",
            "#164e63",
            "#713f12",
            "#c2410c",
            "rgb(111 82 110 / 81%)",
            "rgb(108 165 163 / 82%)",
            "rgb(114 111 64 / 82%)",
            "rgb(151 132 132 / 82%)",
            "rgb(0 0 0)", // Dark | Always Keep it in the last to support default theme
        ],
        init: () => {
            uLight.currentTheme = uLight.localStorage();

            uLight.textBlack = uLight.themes.slice(0, 8);

            uLight.addCss();
            uLight.createThemes();
            if (uLight.currentTheme != uLight.themes.length - 1) {
                uLight.pluginInit();
            }
        },
        pluginInit: () => {
            if (uLight.initStatus) return;

            uLight.initStatus = true;
            setTimeout(() => {
                document
                    .querySelector("yt-page-navigation-progress")
                    .addEventListener("DOMSubtreeModified", () => {
                        uLight.checkProgress();
                    });
            }, 1000);
            uLight.fixBackground();
            uLight.setTheme(uLight.currentTheme);
        },
        localStorage: (theme = null) => {
            if (typeof Storage !== "undefined") {
                if (theme != null) {
                    uLight.currentTheme = theme;
                    localStorage.setItem("uLight-theme", theme);
                } else
                    return (
                        localStorage.getItem("uLight-theme") ||
                        uLight.currentTheme
                    );
            }
            return uLight.currentTheme;
        },
        fixBackground: () => {
            uLight.setProperty(
                document.querySelector(
                    "ytmusic-browse-response[has-background]:not([disable-gradient]) .background-gradient.ytmusic-browse-response"
                ),
                "background",
                "var(--ytmusic-background)"
            );
        },
        checkProgress: () => {
            if (
                uLight.count == uLight.limit ||
                document
                    .querySelector("yt-page-navigation-progress")
                    .attributes.getNamedItem("aria-valuenow").value == "100"
            ) {
                uLight.fixBackground();
                uLight.count = 0;
            } else {
                uLight.count++;
                uLight.checkProgress();
            }
        },
        removeStyle: (id) => {
            const styleSheet = document.getElementById(id);
            if (styleSheet) {
                styleSheet.remove();
            }
        },
        createStyle: (style, id = null) => {
            const styleSheet = document.createElement("style");
            styleSheet.id = id || new Date().getTime();
            styleSheet.innerText = style;
            document.head.appendChild(styleSheet);
        },
        addCss: () => {
            let pStyles = "";
            uLight.themes.map(
                (t, i) =>
                    (pStyles += `
                .uLight-theme-container p:nth-child(${i + 1}) {
                    background: ${uLight.themes[i]};
                }
            `)
            );
            const style = `
                .icon.ytmusic-menu-navigation-item-renderer {
                    fill: #000;
                }
                picture.ytmusic-fullbleed-thumbnail-renderer img {
                    opacity: .4;
                }
                .uLight-theme-container {
                    position: absolute;
                    right: 20px;
                    top: 20px;
                    display: flex;
                    flex-direction: column;
                }
                .uLight-theme-container p {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    cursor: pointer;
                    margin-top: 6px;
                    border: 1px solid;
                }
                ${pStyles}
            `;
            uLight.createStyle(style);
        },
        trustedTypes: () => {
            if (window.trustedTypes && trustedTypes.createPolicy) {
                return trustedTypes.createPolicy("uLightPolicy", {
                    createHTML: (string) => string,
                });
            }
            return null;
        },
        createThemes: () => {
            const themeElement = document.createElement("div");
            themeElement.className = "uLight-theme-container";
            let themeOptions = "";
            uLight.themes.map(() => (themeOptions += `<p></p>`));
            themeElement.innerHTML = uLight
                .trustedTypes()
                ?.createHTML(themeOptions);
            document.querySelector("ytmusic-nav-bar").appendChild(themeElement);
            setTimeout(() => {
                uLight.addEvents();
            }, 500);
        },
        addEvents: () => {
            document
                .querySelectorAll(".uLight-theme-container p")
                .forEach((p, index) => {
                    p.addEventListener("click", (e) => {
                        uLight.setTheme(index);
                    });
                });
        },
        setTheme: (theme) => {
            let color;
            color = uLight.themes[theme];

            const cleanColor = color.endsWith(")")
                ? color.split("/")[0].replace(")", "") + ")"
                : color;

            uLight.setProperty(
                document.querySelector("html"),
                "--ytmusic-color-black4",
                cleanColor
            );
            uLight.setProperty(
                document.querySelector("html"),
                "--ytmusic-color-black1",
                "var(--ytmusic-color-black4)"
            );
            uLight.setProperty(
                document.querySelector("body"),
                "background",
                color
            );
            uLight.setProperty(
                document.querySelector(
                    "ytmusic-search-box[is-bauhaus-sidenav-enabled]"
                ),
                "--ytmusic-search-background",
                cleanColor || "#fff"
            );
            uLight.setProperty(
                document.querySelector(".cast-button.ytmusic-cast-button"),
                "--iron-icon-fill-color",
                "#000"
            );
            if (uLight.textBlack.includes(color)) {
                uLight.createStyle(
                    `
                * {
                    color: #000 !important;
                }`,
                    "uLight-text-black"
                );
            } else {
                uLight.removeStyle("uLight-text-black");
            }

            uLight.localStorage(theme);

            uLight.pluginInit();
        },
        setProperty: (selector, key, value, type = "style") => {
            if (selector) selector[type].setProperty(key, value);
        },
    };
    uLight.init();
})();
