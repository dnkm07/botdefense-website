(() => {
  const config = {
    projectId: 'YOUR_SANITY_PROJECT_ID',
    dataset: 'production',
    apiVersion: '2023-10-01',
  };

  const hasConfig =
    config.projectId && config.projectId !== 'YOUR_SANITY_PROJECT_ID';

  const fallbackEvents = [
    {
      title: 'AI for Business Workshop',
      date: '2024-10-18',
      location: 'Vijayawada',
      summary: 'Live session on AI adoption and automation roadmaps.',
      link: 'contact.html',
    },
    {
      title: 'Immersive Learning Demo',
      date: '2024-11-02',
      location: 'Hybrid',
      summary: 'Showcase of XR training labs and interactive simulations.',
      link: 'contact.html',
    },
    {
      title: 'Founder AMA',
      date: '2024-11-20',
      location: 'Online',
      summary: 'Q and A on product strategy, AI ethics, and careers.',
      link: 'contact.html',
    },
  ];

  const fallbackInternships = [
    {
      title: 'AI Engineering Intern',
      mode: 'Hybrid',
      duration: '3 Months',
      summary: 'Work on ML pipelines, prompt systems, and model evaluation.',
      applyLink: 'mailto:hr@bdits.in',
    },
    {
      title: 'Full Stack Intern',
      mode: 'Onsite',
      duration: '3 Months',
      summary: 'Build web apps using modern UI, APIs, and cloud workflows.',
      applyLink: 'mailto:hr@bdits.in',
    },
    {
      title: 'XR Experience Intern',
      mode: 'Remote',
      duration: '3 Months',
      summary: 'Prototype immersive learning and interactive storytelling.',
      applyLink: 'mailto:hr@bdits.in',
    },
  ];

  const buildUrl = (query) => {
    const base = `https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}`;
    return `${base}?query=${encodeURIComponent(query)}`;
  };

  const fetchSanity = async (query) => {
    if (!hasConfig) return null;
    try {
      const response = await fetch(buildUrl(query));
      if (!response.ok) throw new Error('Sanity query failed');
      const payload = await response.json();
      return payload.result || [];
    } catch (error) {
      return null;
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderEvents = (container, items) => {
    if (!container) return;
    if (!items || items.length === 0) {
      container.innerHTML =
        '<div class="data-card">No events are published yet.</div>';
      return;
    }
    container.innerHTML = items
      .map((item) => {
        const date = formatDate(item.date);
        const location = item.location ? item.location : 'Location TBA';
        const link = item.link || 'contact.html';
        return `
          <article class="data-card">
            <h3>${item.title}</h3>
            <div class="data-meta">
              <span>${date}</span>
              <span>${location}</span>
            </div>
            <p>${item.summary || ''}</p>
            <a class="data-link" href="${link}">Learn more</a>
          </article>
        `;
      })
      .join('');
  };

  const renderInternships = (container, items) => {
    if (!container) return;
    if (!items || items.length === 0) {
      container.innerHTML =
        '<div class="data-card">No internships are published yet.</div>';
      return;
    }
    container.innerHTML = items
      .map((item) => {
        const mode = item.mode || 'Hybrid';
        const duration = item.duration || '3 Months';
        const link = item.applyLink || 'mailto:hr@bdits.in';
        return `
          <article class="data-card">
            <h3>${item.title}</h3>
            <div class="data-meta">
              <span>${mode}</span>
              <span>${duration}</span>
            </div>
            <p>${item.summary || ''}</p>
            <a class="data-link" href="${link}">Apply now</a>
          </article>
        `;
      })
      .join('');
  };

  const fetchApi = async (path) => {
    try {
      const response = await fetch(path);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  };

  const loadEvents = async () => {
    const container = document.getElementById('eventsGrid');
    if (!container) return;
    const apiEvents = await fetchApi('/api/events');
    if (apiEvents && apiEvents.length >= 0) {
      renderEvents(container, apiEvents.length ? apiEvents : fallbackEvents);
      return;
    }
    const query =
      '*[_type == "event"] | order(date desc)[0..2]{title, date, location, summary, link}';
    const result = await fetchSanity(query);
    renderEvents(container, result || fallbackEvents);
  };

  const loadInternships = async () => {
    const container = document.getElementById('internshipsGrid');
    if (!container) return;
    const apiInternships = await fetchApi('/api/internships');
    if (apiInternships && apiInternships.length >= 0) {
      renderInternships(container, apiInternships.length ? apiInternships : fallbackInternships);
      return;
    }
    const query =
      '*[_type == "internship"] | order(_createdAt desc)[0..5]{title, mode, duration, summary, applyLink}';
    const result = await fetchSanity(query);
    renderInternships(container, result || fallbackInternships);
  };

  loadEvents();
  loadInternships();
})();
