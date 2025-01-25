const projectsData = [
  {
    title: "M1: Run Buddy",
    liveLink: "https://niksharpkings.github.io/UCLAxU2-M1-Run-Buddy/",
    repoLink: "https://github.com/Niksharpkings/UCLAxU2-M1-Run-Buddy",
    description: "Module 1: Run Buddy was and is the first UCLAx+U2 module 1 demo project & website we created using: Vanilla HTML5, CSS3, Github, Github Pages, ReadMe.md, Git-Bash. It is a mockup/prototype/demo project that was used as template guide to teach us and learn the very basics rudimentary and foundation in web development.",
    imageSrc: "./assets/images/module1-runbuddy.png",
    imageAlt: "module-1-run-buddy-project"
  },
  {
    title: "M1-C1: Horiseon",
    liveLink: "https://niksharpkings.github.io/Horiseon-Module-1-Challenge-1/",
    repoLink: "https://github.com/Niksharpkings/Horiseon-Module-1-Challenge-1",
    description: "Horiseon was my first challenge website assignment for module 1: HTML, CSS, Git. We created using: Vanilla HTML5, CSS3, Github, Github Pages, ReadMe.md, Git-Bash. It is a mockup/prototype/demo project that was used as template guide to help us learn the basics rudimentary and foundation in web development.",
    imageSrc: "./assets/images/heriseon.png",
    imageAlt: "Horiseon Project Module 1 Challenge 1 Assignment"
  },
  {
    title: "M2: Run Buddy Version 2.0",
    liveLink: "https://niksharpkings.github.io/Run-Buddy-v2/",
    repoLink: "https://github.com/Niksharpkings/Run-Buddy-v2/",
    description: "UCLAx+U2's Run Buddy v2 was the second demonstrated module project provided by the school. Website we created using: Vanilla HTML5, CSS3, Github, Github Pages, ReadMe.md, Git-Bash. It is a mockup/prototype/demo project that was used as template guide to help us learn the basics rudimentary and foundation in web development.",
    imageSrc: "./assets/images/runbuddyproject4.png",
    imageAlt: "project-run-buddy-v2"
  },
  {
    title: "M3-C3: Revamped: Password-Generator V2",
    liveLink: "https://niksharpkings.github.io/password-generator/",
    repoLink: "https://github.com/Niksharpkings/password-generator",
    description: "Password Generator V2 is a Revamped UCLAx+U2's Challenge Assignment #3. Website we created using: Vanilla HTML5, CSS3, Javascript, Json, Github, Github Pages, ReadMe.md, .txt, Git-Bash. Generating a password when the user presses 'Generate Password'. A JavaScript prompt will ask the user will then be prompted to choose the length the password they want to generate, from 8 characters to 128 characters. The user will then be prompted to choose the type of characters they want to use. By Revamp I mean I redid the entire project from scratch after graduation.",
    imageSrc: "./assets/images/passwordgeneratorv2.png",
    imageAlt: "project-run-buddy-v2"
  },
  {
    title: "Surf Report",
    liveLink: "N/a",
    repoLink: "N/a",
    description: "wip",
    imageSrc: "./assets/images/surfreportproject1.png",
    imageAlt: "surfreportproject1"
  },
  {
    title: "Calculator Project",
    liveLink: "N/a",
    repoLink: "N/a",
    description: "wip",
    imageSrc: "./assets/images/calculatorproject2.jpg",
    imageAlt: "project-1"
  },
  {
    title: "Pastel puzzels",
    liveLink: "N/a",
    repoLink: "N/a",
    description: "wip",
    imageSrc: "./assets/images/pastelpuzzelsproject3.png",
    imageAlt: "project-1"
  },
  {
    title: "Ledwall",
    liveLink: "N/a",
    repoLink: "N/a",
    description: "wip",
    imageSrc: "./assets/images/ledwallproject5.png",
    imageAlt: "project-1"
  },
  {
    title: "taskmaster-pro",
    liveLink: "https://niksharpkings.github.io/taskmaster-pro/",
    repoLink: "https://github.com/Niksharpkings/taskmaster-pro/",
    description: "wip",
    imageSrc: "./assets/images/taskmasterpro.png",
    imageAlt: "taskmaster-pro"
  }
];

function generateProjects() {
  const projectsSection = document.createElement('section');
  projectsSection.className = 'projects';
  projectsSection.id = 'projects';

  const projectHeader = document.createElement('h1');
  projectHeader.className = 'project-header';
  projectHeader.innerHTML = 'Projects: ⚒WIP Under Construction🛠 <small>Redoing, Most of my projects are not shown, some are mockups or blank fillers</small>';
  projectsSection.appendChild(projectHeader);

  projectsData.forEach(project => {
    const projectContainer = document.createElement('div');
    projectContainer.className = 'project-container';

    const projectTitle = document.createElement('p');
    projectTitle.className = 'project-title';
    projectTitle.textContent = project.title;
    projectContainer.appendChild(projectTitle);

    const projectGridContainer = document.createElement('article');
    projectGridContainer.className = 'project-grid-container';

    const projectContainerLeft = document.createElement('section');
    projectContainerLeft.className = 'project-container-left';

    const figure = document.createElement('figure');
    const figcaption = document.createElement('figcaption');
    const h6 = document.createElement('h6');
    h6.textContent = 'Repository Information:';
    figcaption.appendChild(h6);
    figure.appendChild(figcaption);
    projectContainerLeft.appendChild(figure);

    const liveLink = document.createElement('h2');
    liveLink.className = 'project-repository-dialog';
    liveLink.innerHTML = `Github Pages Live Deployed Link: <a class="project-repository-dialog" rel="noopener noreferrer" href="${project.liveLink}" target="_blank">${project.liveLink}</a>`;
    projectContainerLeft.appendChild(liveLink);

    const repoLink = document.createElement('h2');
    repoLink.className = 'project-repository-dialog';
    repoLink.innerHTML = `Github Repository Link: <a class="project-repository-dialog" rel="noopener noreferrer" href="${project.repoLink}" target="_blank">${project.repoLink}</a>`;
    projectContainerLeft.appendChild(repoLink);

    const description = document.createElement('p');
    description.className = 'project-repository-dialog';
    description.textContent = project.description;
    projectContainerLeft.appendChild(description);

    projectGridContainer.appendChild(projectContainerLeft);

    const projectContainerRight = document.createElement('section');
    projectContainerRight.className = 'project-container-right';

    const figureRight = document.createElement('figure');
    const figcaptionRight = document.createElement('figcaption');
    const h5 = document.createElement('h5');
    h5.textContent = 'Banner Image:';
    figcaptionRight.appendChild(h5);
    figureRight.appendChild(figcaptionRight);
    projectContainerRight.appendChild(figureRight);

    const picture = document.createElement('picture');
    const source = document.createElement('source');
    source.srcset = project.imageSrc.replace('.png', '.webp');
    source.type = 'image/webp';
    source.rel = 'noopener noreferrer';
    picture.appendChild(source);

    const img = document.createElement('img');
    img.src = project.imageSrc;
    img.width = 600;
    img.height = 200;
    img.className = 'project-container-right-img';
    img.rel = 'noopener noreferrer';
    img.loading = 'eager';
    img.title = project.imageAlt;
    img.alt = project.imageAlt;
    picture.appendChild(img);

    projectContainerRight.appendChild(picture);
    projectGridContainer.appendChild(projectContainerRight);

    projectContainer.appendChild(projectGridContainer);
    projectsSection.appendChild(projectContainer);
  });

  document.querySelector('main').appendChild(projectsSection);
}

document.addEventListener('DOMContentLoaded', generateProjects);
