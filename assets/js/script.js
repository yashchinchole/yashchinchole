const nav = document.querySelector(".nav"),
  navList = nav.querySelectorAll("li"),
  totalNavList = navList.length,
  allSection = document.querySelectorAll(".section"),
  totalSection = allSection.length;

for (let i = 0; i < totalNavList; i++) {
  const a = navList[i].querySelector("a");
  a.addEventListener("click", function () {
    for (let k = 0; k < totalSection; k++) {
      allSection[k].classList.remove("back-section");
    }
    for (let j = 0; j < totalNavList; j++) {
      if (navList[j].querySelector("a").classList.contains("active")) {
        allSection[j].classList.add("back-section");
      }
      navList[j].querySelector("a").classList.remove("active");
    }
    this.classList.add("active");
    showSection(this);
    if (window.innerWidth < 1200) {
      asideSectionTogglerBtn();
    }
  });
}

function showSection(element) {
  for (let k = 0; k < totalSection; k++) {
    allSection[k].classList.remove("active");
  }
  const target = element.getAttribute("href").split("#")[1];
  document.querySelector("#" + target).classList.add("active");
}

function updateNav(element) {
  for (let i = 0; i < totalNavList; i++) {
    navList[i].querySelector("a").classList.remove("active");
    const target = element.getAttribute("href").split("#")[1];
    if (
      target ===
      navList[i].querySelector("a").getAttribute("href").split("#")[1]
    ) {
      navList[i].querySelector("a").classList.add("active");
    }
  }
}

const navTogglerBtn = document.querySelector(".nav-toggler"),
  aside = document.querySelector(".aside");
navTogglerBtn.addEventListener("click", () => {
  asideSectionTogglerBtn();
});

function asideSectionTogglerBtn() {
  aside.classList.toggle("open");
  navTogglerBtn.classList.toggle("open");
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("skills.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      const skillsRow = document.getElementById("skills-row");
      if (!skillsRow) {
        console.error('Element with ID "skills-row" not found.');
        return;
      }
      data.forEach((skill) => {
        const skillItem = document.createElement("div");
        skillItem.className = "skills-item padd-15";

        const skillItemInner = document.createElement("div");
        skillItemInner.className = "skills-item-inner";

        const icon = document.createElement("div");
        icon.className = "icon";

        const img = document.createElement("img");
        img.src = skill.icon;
        img.alt = skill.name;

        icon.appendChild(img);

        const title = document.createElement("h4");
        title.textContent = skill.name;

        skillItemInner.appendChild(icon);
        skillItemInner.appendChild(title);

        skillItem.appendChild(skillItemInner);
        skillsRow.appendChild(skillItem);
      });
    })
    .catch((error) => console.error("Error loading skills:", error));
});

document.addEventListener("DOMContentLoaded", () => {
  fetch("projects.json")
    .then((response) => response.json())
    .then((data) => {
      const projectsContainer = document.getElementById("projects-container");
      data.forEach((project) => {
        const projectItem = document.createElement("div");
        projectItem.classList.add("projects-item", "padd-15");

        let websiteLink = "";
        if (project.website) {
          websiteLink = `<a href="${project.website}" target="_blank"><i class="fas fa-globe"></i></a>`;
        }

        projectItem.innerHTML = `
          <div class="projects-item-inner">
            <div class="projects-img">
              <img src="${project.img}" alt="${project.title}">
            </div>
            <div class="projects-info">
              <h3 class="projects-title">${project.title}</h3>
              <p class="projects-about">${project.about}</p>
            </div>
            <div class="projects-links">
              <a href="${project.github}" target="_blank"><i class="fab fa-github"></i></a>
              ${websiteLink}
            </div>
          </div>
        `;

        projectsContainer.appendChild(projectItem);
      });
    })
    .catch((error) => console.error("Error fetching projects:", error));
});
