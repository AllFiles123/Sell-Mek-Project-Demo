/* =====================================================
   SELL MEK - ORIGINAL HERO + COUNT ANIMATION
===================================================== */


/* =====================================================
   COUNTING ANIMATION
   Works for Hero Dashboard and Results sections
===================================================== */

function animateSingleCount(el, index = 0) {
    if (!el || el.dataset.countAnimated === "true") return;
    el.dataset.countAnimated = "true";

    const target = parseFloat(el.getAttribute("data-target")) || 0;
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    const useComma = el.getAttribute("data-comma") === "true";
    const duration = 1800;
    const delay = index * 80;

    setTimeout(() => {
        const startTime = performance.now();
        function update(time) {
            const progress = Math.min((time - startTime) / duration, 1);
            const easing = 1 - Math.pow(1 - progress, 3);
            const current = target * easing;
            const display = target % 1 !== 0 ? current.toFixed(1) : Math.floor(current);
            const number = useComma ? Number(display).toLocaleString() : display;
            el.textContent = prefix + number + suffix;
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                const finalNumber = useComma ? target.toLocaleString() : target;
                el.textContent = prefix + finalNumber + suffix;
            }
        }
        requestAnimationFrame(update);
    }, delay);
}

function animateCounts() {
    const counters = Array.from(document.querySelectorAll(".count"));
    if (!counters.length) return;

    const startVisible = (elements) => {
        elements.forEach((el, index) => animateSingleCount(el, index));
    };

    if (!("IntersectionObserver" in window)) {
        startVisible(counters);
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            animateSingleCount(entry.target);
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.18 });

    counters.forEach(el => observer.observe(el));
}

/* =====================================================
   SOCIAL ICON ENDLESS SCROLL ANIMATION
===================================================== */

function animateSocialIcons() {

    const social =
        document.querySelector(".social");

    const items = Array.from(
        document.querySelectorAll(
            ".social .social-item"
        )
    );

    if (
        !social ||
        !items.length ||
        social.dataset.animated === "true"
    ) {
        return;
    }

    social.dataset.animated = "true";

    /* Duplicate icons for seamless movement */
    items.forEach(item => {

        const clone = item.cloneNode(true);

        clone.setAttribute(
            "aria-hidden",
            "true"
        );

        clone.tabIndex = -1;

        social.appendChild(clone);
    });

    const itemHeight = 55;
    const loopHeight =
        items.length * itemHeight;

    let position = 0;
    let lastTime = null;

    const speed = 28;

    function move(time) {

        if (lastTime === null) {
            lastTime = time;
        }

        const delta =
            (time - lastTime) / 1000;

        lastTime = time;

        position -= speed * delta;

        if (Math.abs(position) >= loopHeight) {
            position += loopHeight;
        }

        social
            .querySelectorAll(".social-item")
            .forEach(item => {

                item.style.transform =
                    `translateY(${position}px)`;

            });

        requestAnimationFrame(move);
    }

    requestAnimationFrame(move);
}




/* =====================================================
   SECTION REVEAL ANIMATIONS
   Headings fade in, then result cards appear one by one.
===================================================== */
function setupSectionAnimations() {
    const headings = document.querySelectorAll('.dark-section-heading');
    const cards = Array.from(document.querySelectorAll('.results-counter-grid .dark-result-card'));

    if ('IntersectionObserver' in window) {
        const headingObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('heading-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.28 });
        headings.forEach(h => headingObserver.observe(h));

        if (cards.length) {
            const revealCardsSequentially = () => {
                let current = 0;
                const revealNext = () => {
                    if (current >= cards.length) return;
                    const card = cards[current++];
                    const onFinished = (event) => {
                        if (event.target !== card || event.propertyName !== 'transform') return;
                        card.removeEventListener('transitionend', onFinished);
                        revealNext();
                    };
                    card.addEventListener('transitionend', onFinished);
                    requestAnimationFrame(() => card.classList.add('card-visible'));
                    // Safety fallback if a browser does not fire transitionend.
                    window.setTimeout(() => {
                        card.removeEventListener('transitionend', onFinished);
                        if (current <= cards.length && !cards[current]?.classList.contains('card-visible')) revealNext();
                    }, 750);
                };
                revealNext();
            };

            const cardsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    observer.unobserve(entry.target);
                    revealCardsSequentially();
                });
            }, { threshold: 0.22 });
            cardsObserver.observe(document.querySelector('.results-counter-grid'));
        }
    } else {
        headings.forEach(h => h.classList.add('heading-visible'));
        // No artificial delay: each card starts immediately after the previous reveal completes.
        cards.reduce((chain, card) => chain.then(() => new Promise(resolve => {
            const done = () => { card.removeEventListener('transitionend', done); resolve(); };
            card.addEventListener('transitionend', done);
            requestAnimationFrame(() => card.classList.add('card-visible'));
            window.setTimeout(done, 750);
        })), Promise.resolve());
    }
}



/* =====================================================
   HERO HEADLINE SLIDER — SLOW ENTERPRISE MOTION
===================================================== */
function setupHeroSlider() {
    const slider = document.querySelector(".hero-slider");
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const counter = document.querySelector("#hero-current");

    if (!slider || slides.length < 2) return;

    let current = 0;
    const interval = 8500;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            const active = i === index;
            slide.classList.toggle("is-active", active);
            slide.setAttribute("aria-hidden", active ? "false" : "true");
        });

        if (counter) counter.textContent = String(index + 1);
    }

    showSlide(current);

    window.setInterval(() => {
        current = (current + 1) % slides.length;
        showSlide(current);
    }, interval);
}




/* =====================================================
   CLIENT REVIEW SLIDER — SLOW 3-REVIEW LOOP
   Right -> highlight slightly upward -> left -> next
===================================================== */
function setupClientReviews() {
    // Reviews are rendered as a CSS-driven, continuous right-to-left marquee.
    // Hovering .vertical-reviews pauses the track.
}



/* =====================================================
   BUTTON ACTIONS
===================================================== */

function setupButtons() {

    // ".start" is now a direct link to booking.html (Book a Meeting),
    // so it needs no scroll-to-section click handler.

    const contact =
        document.querySelector(".contact");


    if (contact) {

        contact.addEventListener(
            "click",
            () => {

                const footer =
                    document.querySelector(
                        ".site-footer"
                    );

                if (footer) {

                    footer.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }
        );
    }
}




/* =====================================================
   BOOKING FORM
===================================================== */
function setupBookingForm() {
    const form = document.getElementById("booking-form");
    const success = document.getElementById("booking-success");
    const again = document.getElementById("booking-again-btn");
    if (!form || !success) return;

    const dateInput = document.getElementById("bk-date");
    if (dateInput) {
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        dateInput.min = today.toISOString().split("T")[0];
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        success.classList.add("is-visible");
        success.setAttribute("aria-hidden", "false");
    });

    if (again) {
        again.addEventListener("click", () => {
            success.classList.remove("is-visible");
            success.setAttribute("aria-hidden", "true");
            form.reset();
            window.setTimeout(() => {
                const first = document.getElementById("bk-name");
                if (first) first.focus();
            }, 220);
        });
    }
}

/* =====================================================
   PAGE-TRANSITION LOADER
   Shows a full-screen loading animation whenever the visitor
   navigates from one nav-bar link to another (or any internal
   page link), then fades it out once the new page has painted.
===================================================== */
function setupPageLoader() {

    let loader = document.querySelector(".page-loader");

    if (!loader) {
        loader = document.createElement("div");
        loader.className = "page-loader";
        loader.innerHTML =
            '<div class="page-loader-mark">' +
                '<div class="page-loader-ring"></div>' +
                '<span class="page-loader-label">Loading</span>' +
            "</div>";
        document.body.appendChild(loader);
    }

    /* Entrance: fade the loader out once this page is ready. */
    window.requestAnimationFrame(() => {
        window.setTimeout(() => {
            loader.classList.add("is-hidden");
        }, 260);
    });

    const isSamePageAnchor = (link) => {
        const href = link.getAttribute("href") || "";
        if (href.startsWith("#")) return true;
        if (href.startsWith("mailto:") || href.startsWith("tel:")) return true;
        if (link.target === "_blank") return true;
        if (link.hasAttribute("download")) return true;
        return false;
    };

    /* Any internal link that points to one of the site's own
       .html pages gets the transition treatment: nav bar links,
       the logo, footer links, and in-page CTA links alike. */
    const links = Array.from(document.querySelectorAll('a[href$=".html"]'));

    links.forEach((link) => {

        if (isSamePageAnchor(link)) return;

        link.addEventListener("click", (event) => {

            const href = link.getAttribute("href");

            /* Let modified clicks (open in new tab, etc.) behave normally. */
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            event.preventDefault();

            loader.classList.remove("is-hidden");

            window.setTimeout(() => {
                window.location.href = href;
            }, 380);
        });
    });
}


/* =====================================================
   PROCESS FLOW — CONNECT THE DOTTED PATH TO THE CIRCLES
   Draws the dashed connector as an SVG line measured against
   the actual rendered position of each step circle, so it
   always lines up correctly regardless of screen width.
===================================================== */
function setupProcessPath() {

    const flow = document.querySelector(".reference-process-flow");
    const pathWrap = document.querySelector(".reference-process-path");
    const cards = Array.from(document.querySelectorAll(".reference-process-card"));

    if (!flow || !pathWrap || cards.length < 2) return;

    /* Replace the old fixed-angle dashed segments with a single
       SVG that is redrawn to match the circles' real positions. */
    let svg = pathWrap.querySelector("svg.process-path-svg");
    if (!svg) {
        pathWrap.querySelectorAll(".path-segment, .path-start").forEach(el => el.remove());
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "process-path-svg");
        svg.style.position = "absolute";
        svg.style.inset = "0";
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.overflow = "visible";

        const startDot = document.createElementNS(svg.namespaceURI, "circle");
        startDot.setAttribute("class", "process-path-start-dot");
        startDot.setAttribute("r", "9");

        const line = document.createElementNS(svg.namespaceURI, "polyline");
        line.setAttribute("class", "process-path-line");
        line.setAttribute("fill", "none");

        svg.appendChild(line);
        svg.appendChild(startDot);
        pathWrap.appendChild(svg);
    }

    const line = svg.querySelector(".process-path-line");
    const startDot = svg.querySelector(".process-path-start-dot");
    const arrow = pathWrap.querySelector(".path-arrow");

    function draw() {
        const flowBox = flow.getBoundingClientRect();
        if (!flowBox.width || !flowBox.height) return;

        const centers = cards.map(card => {
            const box = card.getBoundingClientRect();
            return {
                x: box.left + box.width / 2 - flowBox.left,
                y: box.top + box.height / 2 - flowBox.top
            };
        });

        /* On the stacked mobile layout the path is hidden by CSS,
           so skip the (irrelevant) measurement work there. */
        if (getComputedStyle(pathWrap).display === "none") return;

        const points = centers.map(p => `${p.x},${p.y}`).join(" ");
        line.setAttribute("points", points);

        /* Start marker sits just outside the first circle, on the left,
           vertically aligned with its center — like the original design. */
        const first = centers[0];
        startDot.setAttribute("cx", 11);
        startDot.setAttribute("cy", first.y);

        /* End arrow sits just outside the last circle, on the right,
           vertically aligned with its center, tilted to follow the
           incoming line's slope. */
        if (arrow) {
            const last = centers[centers.length - 1];
            const prev = centers[centers.length - 2];
            const angle = Math.atan2(last.y - prev.y, last.x - prev.x) * (180 / Math.PI);
            arrow.style.left = "auto";
            arrow.style.right = "0";
            arrow.style.top = `${last.y}px`;
            arrow.style.transform = `translateY(-50%) rotate(${angle}deg)`;
        }
    }

    draw();
    window.addEventListener("resize", draw);

    /* Re-measure once webfonts/layout settle (card copy can reflow). */
    window.setTimeout(draw, 200);
    window.setTimeout(draw, 700);
}


/* =====================================================
   START WEBSITE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* Original-style number animation */
        animateCounts();

        /* Social icons */
        animateSocialIcons();

        /* Hero headline slider */
        setupHeroSlider();

        /* Client review slider */
        setupClientReviews();

        /* Booking form */
        setupBookingForm();

        /* Buttons */
        setupButtons();

        /* Results and heading reveal effects */
        setupSectionAnimations();

        /* Loading animation between nav / page transitions */
        setupPageLoader();

        /* Keep the "Process We Follow" dotted path locked to the circles */
        setupProcessPath();

    }
);