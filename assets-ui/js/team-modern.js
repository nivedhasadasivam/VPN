document.addEventListener('DOMContentLoaded', function () {
  const teamData = [
    {
      id: 1,
      name: 'LIBIN K',
      role: 'Team Lead',
      image: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/Team%20Members/libin.png',
      bio: 'Leading VPNexues with a focus on innovation, operations, and growth across markets.',
      skills: ['Strategy', 'Product Vision', 'Team Growth'],
      social: [
        { icon: 'fab fa-facebook-f', href: '#' },
        { icon: 'fab fa-instagram', href: '#' },
        { icon: 'fab fa-linkedin-in', href: '#' }
      ]
    },
    {
      id: 2,
      name: 'SUNIL KUMAR R',
      role: 'Frontend UI Developer',
      label: 'Frontend',
      image: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/Team%20Members/sunil.jpeg',
      bio: 'Building clean, responsive interfaces and refining the user experience across devices.',
      skills: ['HTML', 'CSS', 'JavaScript', 'Responsive UI'],
      social: [
        { icon: 'fab fa-facebook-f', href: '#' },
        { icon: 'fab fa-instagram', href: '#' },
        { icon: 'fab fa-linkedin-in', href: '#' }
      ]
    },
    {
      id: 3,
      name: 'SATHISH R',
      role: 'Web Developer',
      label: 'Development',
      image: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/Team%20Members/Satheesh.jpeg',
      bio: 'Developing reliable web solutions with an emphasis on performance and scalability.',
      skills: ['JavaScript', 'Node.js', 'APIs', 'Web Apps'],
      social: [
        { icon: 'fab fa-facebook-f', href: '#' },
        { icon: 'fab fa-instagram', href: '#' },
        { icon: 'fab fa-linkedin-in', href: '#' }
      ]
    },
    {
      id: 4,
      name: 'MONIKA V',
      role: 'UI/UX Designer',
      label: 'Design',
      image: 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets/Team%20Members/monica.png',
      bio: 'Creating intuitive interfaces and experiences that keep users engaged and delighted.',
      skills: ['UX', 'Figma', 'Interaction Design'],
      social: [
        { icon: 'fab fa-facebook-f', href: '#' },
        { icon: 'fab fa-instagram', href: '#' },
        { icon: 'fab fa-linkedin-in', href: '#' }
      ]
    }
  ];

  const roles = ['All', 'Team Lead', 'Web Developer', 'UI/UX Designer', 'Frontend UI Developer'];
  const itemsPerPage = 4;
  const root = document.getElementById('teamGrid');
  const pagination = document.getElementById('teamPagination');
  const resultsLabel = document.getElementById('teamResults');
  const filtersContainer = document.getElementById('teamFilters');
  const searchInput = document.getElementById('teamSearch');
  const modal = document.getElementById('teamModal');
  const modalImage = document.getElementById('teamModalImage');
  const modalTitle = document.getElementById('teamModalTitle');
  const modalRole = document.getElementById('teamModalRole');
  const modalBio = document.getElementById('teamModalBio');
  const modalSkills = document.getElementById('teamModalSkills');
  const modalSocial = document.getElementById('teamModalSocial');
  const closeButtons = modal ? modal.querySelectorAll('[data-close-modal]') : [];

  let activeRole = 'All';
  let activePage = 1;
  let filteredData = [...teamData];

  function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const page = Number(params.get('page')) || 1;
    return page < 1 ? 1 : page;
  }

  function updateUrl(page) {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  }

  function getFilteredData() {
    const query = searchInput.value.trim().toLowerCase();
    return teamData.filter((member) => {
      const matchesRole = activeRole === 'All' || member.role === activeRole;
      const matchesSearch =
        member.name.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.bio.toLowerCase().includes(query);
      return matchesRole && matchesSearch;
    });
  }

  function renderFilters() {
    filtersContainer.innerHTML = '';
    roles.forEach((role) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'team-filter-btn' + (role === activeRole ? ' active' : '');
      button.textContent = role;
      button.setAttribute('aria-pressed', role === activeRole);
      button.addEventListener('click', () => {
        activeRole = role;
        activePage = 1;
        renderFilters();
        render();
      });
      filtersContainer.appendChild(button);
    });
  }

  function renderCards() {
    const data = getFilteredData();
    const start = (activePage - 1) * itemsPerPage;
    const pageItems = data.slice(start, start + itemsPerPage);

    root.innerHTML = '';
    if (!pageItems.length) {
      root.innerHTML =
        '<div class="team-error">No team members match your search or filter. Try another term.</div>';
      return;
    }

    pageItems.forEach((member) => {
      const card = document.createElement('article');
      card.className = 'team-card';
      card.innerHTML = `
        <div class="team-card__media">
          <img src="${member.image}" alt="${member.name}" loading="lazy">
        </div>
        <div class="team-card__body">
          <span class="team-card__label">${member.label}</span>
          <h3 class="team-card__name">${member.name}</h3>
          <p class="team-card__position">${member.role}</p>
          <p class="team-card__bio">${member.bio}</p>
          <div class="team-card__footer">
            <div class="team-card__social" aria-label="Social profiles">
              ${member.social
                .map(
                  (social) =>
                    `<a href="${social.href}" target="_blank" rel="noreferrer noopener"><i class="${social.icon}" aria-hidden="true"></i></a>`
                )
                .join('')}
            </div>
            <button type="button" class="team-card__button" data-member-id="${member.id}">View Profile</button>
          </div>
        </div>
      `;
      root.appendChild(card);
    });
  }

  function renderPagination() {
    const data = getFilteredData();
    const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
    const pages = [];
    const startPage = Math.max(1, activePage - 1);
    const endPage = Math.min(totalPages, activePage + 1);

    pagination.innerHTML = '';

    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.textContent = 'Prev';
    prevButton.disabled = activePage === 1;
    prevButton.addEventListener('click', () => {
      activePage = Math.max(1, activePage - 1);
      render();
    });
    pagination.appendChild(prevButton);

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    if (startPage > 1) {
      pagination.appendChild(createPageButton(1));
      if (startPage > 2) {
        pagination.appendChild(createEllipsis());
      }
    }

    pages.forEach((page) => pagination.appendChild(createPageButton(page)));

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pagination.appendChild(createEllipsis());
      }
      pagination.appendChild(createPageButton(totalPages));
    }

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.textContent = 'Next';
    nextButton.disabled = activePage === totalPages;
    nextButton.addEventListener('click', () => {
      activePage = Math.min(totalPages, activePage + 1);
      render();
    });
    pagination.appendChild(nextButton);
  }

  function createPageButton(page) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = page;
    if (page === activePage) {
      button.classList.add('active');
      button.setAttribute('aria-current', 'page');
    }
    button.addEventListener('click', () => {
      activePage = page;
      render();
    });
    return button;
  }

  function createEllipsis() {
    const span = document.createElement('span');
    span.textContent = '...';
    span.style.color = 'var(--team-muted)';
    span.style.display = 'inline-flex';
    span.style.minWidth = '32px';
    span.style.alignItems = 'center';
    span.style.justifyContent = 'center';
    return span;
  }

  function renderResultsText() {
    const data = getFilteredData();
    const total = data.length;
    const start = total ? (activePage - 1) * itemsPerPage + 1 : 0;
    const end = Math.min(total, activePage * itemsPerPage);
    resultsLabel.textContent = `${total} team member${total === 1 ? '' : 's'} found. Showing ${start}-${end}.`;
  }

  function openModal(member) {
    modalImage.src = member.image;
    modalImage.alt = member.name;
    modalRole.textContent = member.role;
    modalTitle.textContent = member.name;
    modalBio.textContent = member.bio;
    modalSkills.innerHTML = member.skills
      .map((skill) => `<span>${skill}</span>`)
      .join('');
    modalSocial.innerHTML = member.social
      .map(
        (item) =>
          `<a href="${item.href}" target="_blank" rel="noreferrer noopener"><i class="${item.icon}" aria-hidden="true"></i><span class="sr-only">${member.name} social profile</span></a>`
      )
      .join('');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    var dialog = modal.querySelector('.team-modal__dialog');
    if (dialog) dialog.focus();
  }

  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }

  function attachCardListeners() {
    root.querySelectorAll('.team-card__button').forEach((button) => {
      button.addEventListener('click', () => {
        const memberId = Number(button.dataset.memberId);
        const member = teamData.find((item) => item.id === memberId);
        if (member) {
          openModal(member);
        }
      });
    });
  }

  function render() {
    filteredData = getFilteredData();
    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    if (activePage > totalPages) activePage = totalPages;
    updateUrl(activePage);
    renderCards();
    renderPagination();
    renderResultsText();
    attachCardListeners();
  }

  searchInput.addEventListener('input', () => {
    activePage = 1;
    render();
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeModal);
  });

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.hasAttribute('data-close-modal')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
      }
    });
  }

  activePage = getPageFromUrl();
  renderFilters();
  render();
});