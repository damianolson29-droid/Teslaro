"use strict";

// 1. MOBILE NAVIGATION
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");

if (burger && menu) {
  burger.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");

    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
    burger.textContent = isOpen ? "✕" : "☰";
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open navigation menu");
      burger.textContent = "☰";
    });
  });
}

// 2. HERO IMAGE SLIDER
const slides = [...document.querySelectorAll(".slide")];
const dots = [...document.querySelectorAll(".dot")];
const previousButton = document.getElementById("prev");
const nextButton = document.getElementById("next");

let currentSlide = 0;
let sliderTimer;

function showSlide(index) {
  if (slides.length === 0) return;

  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle("on", i === currentSlide);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
    dot.setAttribute(
      "aria-current",
      i === currentSlide ? "true" : "false"
    );
  });
}

function startSlider() {
  clearInterval(sliderTimer);

  if (
    slides.length > 1 &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    sliderTimer = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5000);
  }
}

if (slides.length > 0) {
  previousButton?.addEventListener("click", () => {
    showSlide(currentSlide - 1);
    startSlider();
  });

  nextButton?.addEventListener("click", () => {
    showSlide(currentSlide + 1);
    startSlider();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startSlider();
    });
  });

  showSlide(0);
  startSlider();
}

// 3. SELECT VEHICLE FROM INVENTORY
const carChoice = document.getElementById("carChoice");

document.querySelectorAll("[data-car]").forEach((link) => {
  link.addEventListener("click", () => {
    if (carChoice) {
      carChoice.value = link.dataset.car;
    }
  });
});

// 4. CONTACT FORM AND SUPABASE
const enquiryForm = document.getElementById("enquiryForm");
const formMessage = document.getElementById("formMessage");

if (enquiryForm && formMessage) {
  enquiryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const client = window.tesloraSupabase;

    const name = document.getElementById("customerName").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const car = document.getElementById("carChoice").value;
    const message = document.getElementById("customerMessage").value.trim();

    const button = enquiryForm.querySelector('button[type="submit"]');

    if (!client) {
      formMessage.textContent =
        "Connection unavailable. Please try again.";
      return;
    }

    if (!name || !email || !car || !message) {
      formMessage.textContent = "Please complete all fields.";
      return;
    }

    button.disabled = true;
    formMessage.textContent = "Sending enquiry...";

    try {
      // Authenticate the customer
      const { data: sessionData, error: sessionError } =
        await client.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        const { error: signInError } =
          await client.auth.signInAnonymously();

        if (signInError) throw signInError;
      }

      const { data: userData, error: userError } =
        await client.auth.getUser();

      if (userError) throw userError;
      if (!userData.user) throw new Error("Customer authentication failed.");

      // Save the enquiry conversation
      const { data: conversation, error: conversationError } =
        await client
          .from("support_conversations")
          .insert({
            customer_id: userData.user.id,
            customer_name: name,
            customer_email: email,
            vehicle: car
          })
          .select("id")
          .single();

      if (conversationError) throw conversationError;

      // Save the customer's message
      const { error: messageError } = await client
        .from("support_messages")
        .insert({
          conversation_id: conversation.id,
          sender: "customer",
          message: message
        });

      if (messageError) throw messageError;

      formMessage.textContent =
        "Enquiry sent successfully! Thank you for contacting TESLORA.";

      enquiryForm.reset();

    } catch (error) {
      console.error("Enquiry submission failed:", error);
formMessage.textContent = "Error: " + error.message;;
    } finally {
      button.disabled = false;
    }
  });
}

// 5. FOOTER YEAR
const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


