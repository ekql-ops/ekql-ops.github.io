/* =========================================================
   Abubakar Albakri — portfolio
   ========================================================= */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------
     Case study content
     ------------------------------------------------------- */

  const CASES = {

    securevault: {
      year: '2026',
      title: 'SecureVault',
      standfirst: 'A command-line password manager that encrypts everything with AES-256 and never sends a byte anywhere.',
      stack: ['Python 3.10+', 'cryptography / Fernet', 'PBKDF2-HMAC-SHA256', 'Encrypted JSON', 'pytest / ruff'],
      repo: 'https://github.com/ekql-ops/securevault',
      sections: [
        { h: 'The problem',
          p: [`Almost everyone I know keeps passwords somewhere they shouldn't — a notes app, a spreadsheet, the same six characters with a different number on the end. The proper managers are good, but they're subscriptions, they're cloud-synced, and for anyone slightly suspicious of handing their credentials to a third party there isn't an obvious middle ground.`,
              `I wanted something that stayed on one machine, had no account attached to it, and used encryption I could explain rather than trust.`] },
        { h: 'How it works',
          p: [`On first run you set a master password. That password is never written to disk. A 32-byte salt is generated and stored, and two separate things are derived from the password: a verification hash, and an encryption key produced through PBKDF2-HMAC-SHA256 at 480,000 iterations — the current OWASP minimum.`,
              `The key encrypts the vault with Fernet, which is AES-256 in CBC mode with an HMAC signature attached. The file on disk is unreadable without the master password, and because the key is derived fresh each session it's never sitting in a file waiting to be found.`] },
        { h: 'Inside',
          list: ['Add, retrieve, search and delete credential entries',
                 'Cryptographically secure password generator using the secrets module, with guaranteed character-class coverage',
                 'Strength scoring across length, case, digits and symbols',
                 'Search across service name, username and URL',
                 'Everything stored under ~/.securevault, nothing transmitted'] },
        { h: 'Generating a password',
          code: `$ python vault.py
  Master password: <b>••••••••••••</b>
  [✓] Vault unlocked.

  > 6
  Length (default 20): <b>24</b>

  Password : <b>X7@kqP!2mNvRsLd#9WzYtA4j</b>
  Strength : ✓ Strong
  Length   : 24 characters` },
        { h: 'Testing it properly',
          p: [`It worked, but I had no way of showing it kept working. Writing the tests changed the design more than it changed the behaviour.`,
              `The Vault class used to read its paths from module-level globals, which meant there was no way to exercise it without writing to my real home directory. It now takes an optional directory, defaulting to the same place as before, so every filesystem test runs against a temporary folder and the suite never touches ~/.securevault. I split the interactive prompts away from the logic for the same reason — create() and unlock_with() do the work, initialise() and unlock() handle the asking.`,
              `That refactor is the part I would actually talk about. Nobody writes tests and finds nothing; what they find is that the code was hard to test for a reason.`],
          list: ['64 tests across key derivation, encryption, vault lifecycle, entry CRUD, the generator and strength scoring',
                 '74% line coverage — the gap is the interactive prompt loop, which is not worth mocking',
                 'CI runs the suite on Python 3.10, 3.11 and 3.12, plus ruff, on every push',
                 'The test that matters most asserts the master password appears in neither file on disk'] },
        { h: 'What I learned',
          p: [`The interesting part wasn't the encryption, it was everything around it. Deriving the verification hash and the encryption key from the same password without one leaking information about the other took reading rather than guessing. So did realising that a strong cipher is worthless if the key derivation is fast enough to brute-force.`,
              `I also had to accept a hard trade-off: there is deliberately no recovery path. Lose the master password and the vault is gone. Building in a backdoor would have defeated the point, so the honest answer was to make the warning louder instead.`] },
        { h: 'Next',
          p: [`Clipboard integration with an automatic timeout, an optional second factor, and a breach check against the Have I Been Pwned range API — which can be done without ever sending the full password.`] }
      ]
    },

    shiftpay: {
      year: '2026',
      title: 'ShiftPay',
      standfirst: 'A desktop app for people paid by the shift. One tap a day, and it tells you what you are owed and when it actually lands.',
      stack: ['Python 3.10+', 'tkinter', 'PyInstaller', 'pytest / ruff', 'GitHub Actions'],
      repo: 'https://github.com/ekql-ops/shiftpay',
      download: 'https://github.com/ekql-ops/shiftpay/releases/latest',
      sections: [
        { h: 'The problem',
          p: [`I am paid four-weekly for cleaning work, and the pay period does not line up with the calendar month. A period might run 14 September to 11 October and get paid on the 21st, which means that on any given day I had no straightforward way of knowing what I was owed.`,
              `It got worse when I was off sick. Sick pay is a flat daily amount rather than my hourly rate, it is only payable on days I would have worked, and it arrives on a different schedule to the wages. Working it out on paper was error-prone enough that I once spotted a payslip crediting me three hours on a day I had not worked at all.`] },
        { h: 'The design brief',
          list: ['Logging a day is one tap, not a form',
                 'It names the exact date it is asking about, so catching up after a few days away is unambiguous',
                 'It never silently drops a day I failed to answer',
                 'Sick pay is tracked separately from wages, never blended into one number',
                 'Nothing about my own job is hardcoded — anyone else can set their own pattern'] },
        { h: 'How it works',
          p: [`Each weekday carries its own hourly rate. Leave a day blank and it is not a working day, so the app never asks about it — that one decision is what makes it work for a Sunday-only cleaner as readily as a Monday-to-Saturday one.`,
              `Pay periods are anchored to a real date from a payslip rather than to the calendar. You give it the last day of a period and how many days later the money arrives, and it projects every future period and payday from there. The calendar view then colour-codes each day by what was logged, with the amount underneath, and marks paydays and any recurring benefit payment alongside.`] },
        { h: 'The bug the tests found',
          p: [`The app asks about any day you have not answered yet. The first version built that queue by starting from the most recent entry and walking forward, which seemed obviously correct and was not.`,
              `Close the app halfway through catching up, and the next launch would start from the newest answer — silently skipping every day you had left unanswered behind it. Two days of real work vanished from my own records that way, with no error and nothing on screen to suggest anything was missing. Money I had earned simply was not counted.`,
              `The fix was to scan the whole window for gaps instead of walking forward from the last entry. What I actually take from it is that the bug was invisible: no crash, no warning, just a number that was quietly too low. A test asserting that a gap in the middle gets picked up again is the only thing that would ever have caught it, and writing that test is what made me find it.`] },
        { h: 'Shipping it as a real application',
          p: [`A script someone has to run from a terminal is not something a person uses every night. It is packaged with PyInstaller into a Windows executable with its own icon and taskbar identity, so it can be pinned and opened with one click.`,
              `That forced a decision I had got wrong at first: the data file originally sat next to the code, which breaks the moment the app is packaged or updated. It now lives in the user's own application data directory, written atomically so a crash mid-save cannot truncate it, and the app migrates older files forward on launch without ever re-pricing history that has already been logged.`],
          list: ['57 tests covering pay periods, rate selection, the catch-up queue and the migrations',
                 'CI runs on Windows and Linux across Python 3.10 and 3.12, plus ruff, on every push',
                 'Tagging a release builds the Windows app in CI and attaches the zip automatically',
                 'The data model has no UI imports, which is what makes any of it testable'] },
        { h: 'What I got wrong',
          p: [`I built it around my own job first and only generalised it afterwards, which meant a second pass to pull out every assumption I had baked in — my rates, my shift pattern, my employer's pay cycle, a benefit payment specific to the UK. Starting from "what varies between people" would have been quicker than retrofitting it.`,
              `I was also careful about what the app claims to know. It tracks whatever sick pay rate you give it, but it deliberately does not try to implement statutory sick pay rules — waiting days, linked periods, qualifying conditions. Those vary by country and employer, and getting them silently wrong would be worse than not attempting them.`] },
        { h: 'Next',
          p: [`An optional nightly reminder, CSV export for checking a full year against payslips, and a macOS build — the app itself is already cross-platform, it is only the packaging that is Windows-specific so far.`] }
      ]
    },

    worktrack: {
      year: '2026',
      title: 'WorkTrack',
      standfirst: 'A clock-in app built because the one I was given at work kept losing shifts.',
      stack: ['React', 'Spring Boot', 'PostgreSQL', 'JWT auth', 'Docker', 'Fly.io'],
      repo: 'https://github.com/ekql-ops/worktrack',
      live: 'https://ekql-ops.github.io/worktrack/',
      sections: [
        { h: 'The problem',
          p: [`The scheduling app at my job was genuinely bad. Shifts would disappear from the list, clocking in took four taps through screens that weren't designed for a phone, and there was no way to tell at a glance whether you were running late. People kept a paper backup, which rather defeats the purpose of having an app.`,
              `Nobody was going to fix it, so I wrote the version I wanted to use.`] },
        { h: 'The design brief I set myself',
          list: ['Clocking in is one tap from opening the app, not four',
                 'You can see your current shift status without reading anything',
                 'It tells you before you are late, not after',
                 'It works one-handed on a phone, because that is how it is actually used'] },
        { h: 'How it works',
          p: [`The main screen is a list of shifts you tap directly to clock in and out of. The active shift shows a countdown ring that fills as the shift progresses, so the state is readable from across a room — no reading a timestamp and doing mental arithmetic.`,
              `Late shifts trigger an alert before the start time rather than after it, which is the version that's actually useful. Behind that there's an admin panel for adding staff, assigning shifts and reviewing history.`] },
        { h: 'What I learned',
          p: [`This was the project that taught me component state properly. My first version held everything in one enormous top-level object and re-rendered the entire list every time a countdown ticked, once a second. Watching it stutter on an older phone was a more effective lesson in memoisation than any lecture.`,
              `It also taught me that a good interface is mostly about removing decisions. The original app wasn't missing features — it had more than mine. It just made you think at every step.`] },
        { h: 'Giving it a real backend',
          p: [`The first version kept every shift and session in React state, which meant a refresh threw away the shift someone was halfway through. Worse, the four accounts and their passwords were literals compiled into the JavaScript bundle — anyone who opened devtools could read them. It demoed well and it would not have survived contact with an actual workplace.`,
              `So I wrote the API it was missing: Spring Boot and PostgreSQL, schema managed by Flyway, passwords stored only as BCrypt hashes, and JWT authentication where the role in the token decides what you can reach. An employee asking for the admin endpoints gets a 403, and there is a test that proves it.`,
              `The decision I would actually talk about is a constraint. "One open session per employee" started as a PostgreSQL partial index — correct, but H2 cannot run one, so no test would ever have exercised it. I replaced it with a column holding the employee id while a session is open and NULL once it closes, with a plain UNIQUE on it. Both databases allow repeated NULLs, so the rule is enforced by the database and still covered by the suite. A second simultaneous clock-in fails at the database, not at a check that happened to run first.`],
          list: ['26 tests, run against the same Flyway migration that runs in production',
                 'The clock service takes an injected Clock, so tests place "now" mid-shift instead of sleeping',
                 'Deployed on Fly.io with Postgres on Neon; the machine scales to zero when idle',
                 'Integration tests caught a lazy-loading bug that only appeared once responses were built outside the transaction'] },
        { h: 'Next',
          p: [`Shift swapping between staff, which is the feature people ask for most. The demo also still runs on seeded sample data with its credentials shown on the login screen — fine for something you are invited to try, wrong for anything real.`] }
      ]
    },

    mmubot: {
      year: '2026',
      title: 'MMU Minecraft Society Bot',
      standfirst: 'The sixth-largest society at Manchester Metropolitan was approving 273 members by hand. Group project, six developers.',
      stack: ['Java', 'JDA', 'Discord API', 'DigitalOcean'],
      repo: 'https://github.com/impossibleiman/Discord-Bot-Group-Project',
      sections: [
        { h: 'The problem',
          p: [`The MMU Minecraft Society has 273 Discord members and is the sixth largest society at the university. Every one of those members was being verified manually. Paying members had server perks assigned by hand. There was no record of who invited whom, no support process beyond direct messaging a committee member, and the committee were second and third year students trying to run this alongside their degrees.`,
              `Off-the-shelf bots like Carl-bot and Dyno cover some of it, but none of them knew anything about our perk tiers or our verification requirements, and stitching four generic bots together would have left the committee maintaining four sets of configuration.`] },
        { h: 'My contribution',
          p: [`I worked on the verification and welcome systems, and built the documentation site the society uses as its user guide.`,
              `The welcome system hooks the guild member join event, then diffs the current invite use counts against a cached snapshot to work out which invite code was used and therefore who did the inviting. It posts an embed with the inviter, the invite code, and the account age — that last one being a quick signal for throwaway accounts.`,
              `Verification is a button in a locked channel. One click grants the Member role and opens the rest of the server, replacing what had been a committee member reading a message and manually assigning a role.`] },
        { h: 'A piece of the invite tracking',
          code: `<b>for</b> (Invite invite : guild.retrieveInvites().complete()) {
    <b>int</b> previous = inviteUses.getOrDefault(invite.getCode(), 0);

    <b>if</b> (invite.getUses() > previous) {
        inviteCode = invite.getCode();
        inviter    = invite.getInviter().getAsTag();
    }
    inviteUses.put(invite.getCode(), invite.getUses());
}` },
        { h: 'What the bot does now',
          list: ['Button verification granting the Member role',
                 'Invite tracking with inviter attribution and account age',
                 'Self-assign reaction roles, so staff are not handing out roles',
                 'Temporary event channels that archive themselves afterwards',
                 'Private support tickets',
                 'An AI chat bot in designated channels'] },
        { h: 'What I learned',
          p: [`Working in a team of six on one codebase was the real lesson. We used Trello for the board and Git for everything else, and the first fortnight was mostly us learning to write commits other people could read and to not all edit the same file at once.`,
              `The invite tracking also taught me something about designing against an API you don't control: Discord gives you a list of invites and their use counts, but no event telling you which one was used. The diff-against-cache approach works, but it has a race condition if two people join within the same window. Knowing that limitation and documenting it honestly felt more valuable than pretending it was airtight.`] }
      ]
    },

    gradetracker: {
      year: '2026',
      title: 'GradeTracker',
      standfirst: 'Student records and grades in a properly layered Java application, with UK degree classification built in.',
      stack: ['Java 17', 'SQLite', 'JDBC', 'Layered architecture'],
      repo: 'https://github.com/ekql-ops/grade-tracker',
      sections: [
        { h: 'The problem',
          p: [`This one started as an exercise. I wanted to build something in Java that wasn't a single file with everything crammed into main, because that was how most of my early coursework had looked and I could tell it wasn't how real software is written.`,
              `Grade tracking was a good fit: it has genuine relational data, real business rules in the classification boundaries, and reporting that people actually want.`] },
        { h: 'Architecture',
          p: [`Seven classes across three layers. Models (Student, Grade) hold data and nothing else. Services (StudentService, GradeService, ReportService) hold all the database access and business logic. The CLI class handles every piece of user interaction and knows nothing about SQL.`,
              `The point of the split is that you could replace the CLI with a web front end tomorrow and not touch a line in the service layer. That separation is obvious in hindsight and wasn't obvious to me when I started.`] },
        { h: 'Details worth mentioning',
          list: ['Every query uses prepared statements, so the app is not injectable',
                 'Deleting a student wraps grade deletion and student deletion in one transaction with rollback',
                 'Score-to-classification conversion lives in one place, so the boundaries cannot drift',
                 'CSV export with a timestamped filename, for anyone who would rather work in Excel'] },
        { h: 'A student report',
          code: `╔══════════════════════════════════════════════╗
║  Student Report — Abubakar Albakri           ║
╠══════════════════════════════════════════════╣
║  Course : BSc Computer Science               ║
╠══════════════════════════════════════════════╣
║    Algorithms &amp; Data Structures  <b>82.0%  1st</b> ║
║    Databases                     <b>91.0%  1st</b> ║
║    Computer Networks             <b>68.0%  2:1</b> ║
╠══════════════════════════════════════════════╣
║  Average : <b>80.3%</b>   Overall: <b>1st</b>              ║
╚══════════════════════════════════════════════╝` },
        { h: 'What I learned',
          p: [`Transactions. My first version deleted the student row and then the grade rows, and I only noticed the problem when I imagined it failing between the two statements — orphaned grades pointing at a student who no longer exists. Wrapping both in a transaction with a rollback was a small change that came from thinking about failure rather than success.`,
              `I also learned that the layered structure pays for itself almost immediately. Adding the CSV export took under an hour because the data access already existed and I only had to write the formatting.`] }
      ]
    },

    sentiment: {
      year: '2026',
      title: 'Azure Sentiment Analyser',
      standfirst: 'Sentiment, key phrases and aspect-level opinion mining through Azure Cognitive Services — written to prove the certificate corresponds to something.',
      stack: ['Python', 'Azure Cognitive Services', 'azure-ai-textanalytics', 'NLP'],
      repo: 'https://github.com/ekql-ops/azure-sentiment',
      sections: [
        { h: 'Why I built it',
          p: [`I hold the AI-900 certification, and I was conscious that a certificate on its own only demonstrates you can pass an exam. I wanted something on my GitHub that showed I could actually integrate with the services the exam covers.`,
              `So this reads text — one line, or a file of hundreds — and runs it through Azure's Text Analytics for sentiment, key phrases, language detection and opinion mining.`] },
        { h: 'The part that is genuinely interesting',
          p: [`Document-level sentiment is the easy bit. The feature worth having is opinion mining, which attributes sentiment to specific targets inside a sentence rather than averaging the whole thing out.`,
              `Given "the food was amazing but the service was terrible", a document-level score returns roughly neutral, which is useless. Opinion mining returns food as positive and service as negative — which is the information you'd actually act on.`] },
        { h: 'Output',
          code: `┌─ Result 1 ─────────────────────────────────
│  Language   : English (en) — 100% confidence
│  Sentiment  : <b>MIXED</b>
│  Bar        : [████████████░░░░████████]
│             :  + 52.3%   ~ 5.1%   - 42.6%
│  Key Phrases: food, service
│
│  Sentence breakdown:
│    The food was amazing
│       ↳ food: <b>amazing (positive)</b>
│    but the service was terrible.
│       ↳ service: <b>terrible (negative)</b>
└────────────────────────────────────────────` },
        { h: 'Engineering details',
          list: ['Batches at ten documents per request, which is the API ceiling',
                 'Rate-limit spacing between batches so long files do not get throttled',
                 'Credentials read from environment variables — no keys in the repository',
                 'JSON export of full results for downstream analysis',
                 'Aggregate summary across a batch, with a distribution breakdown'] },
        { h: 'What I learned',
          p: [`Handling a paid API properly is a different discipline from calling an endpoint and printing the response. Every call costs money and every failure needs a sensible fallback, so the error handling ended up being a meaningful proportion of the code.`,
              `Keeping credentials out of the repository is the sort of thing that's obvious once someone says it and easy to get wrong the first time. Environment variables and a committed .env.example is now just how I start any project that touches an API.`] }
      ]
    },

    dbdbot: {
      year: '2025',
      title: 'DBD Bot',
      standfirst: 'A Discord bot for a Dead by Daylight community — searchable game database, levelling, tickets and moderation.',
      stack: ['Node.js', 'Discord.js', 'JavaScript'],
      repo: 'https://github.com/ekql-ops/DBD-Bot',
      sections: [
        { h: 'The problem',
          p: [`Dead by Daylight has well over a hundred perks spread across a large cast of characters, and the community server I was in spent a lot of its time answering the same questions about what a given perk did and whether it was worth running.`,
              `The answers all existed on a wiki. The friction was leaving Discord to go and find them.`] },
        { h: 'What it does',
          list: ['Searchable perk and killer database returned as formatted embeds',
                 'Tier information so the answer includes whether a perk is worth using',
                 'XP and levelling to reward people who actually talk',
                 'Support tickets in private channels',
                 'Standard moderation tooling'] },
        { h: 'What I learned',
          p: [`This was my first bot of any real size and it taught me most of what I brought to the MMU society project later. Command structure, permission handling, keeping a process alive on a server rather than on my laptop, and the fact that a bot which goes down at 2am is a bot somebody notices.`,
              `The database design was also a useful lesson in scope. I started intending to scrape the wiki live and quickly realised a curated local dataset would be faster, more reliable, and not dependent on someone else's page structure staying still.`] }
      ]
    }
  };

  /* -------------------------------------------------------
     Modal
     ------------------------------------------------------- */

  const modal     = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  let lastFocused = null;

  function esc(str) {
    return String(str).replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function buildCase(key) {
    const c = CASES[key];
    if (!c) return '';

    let html = '<article class="case">';
    html += `<p class="case__year">${esc(c.year)}</p>`;
    html += `<h3 class="case__title" id="modalTitle">${esc(c.title)}</h3>`;
    html += `<p class="case__standfirst">${esc(c.standfirst)}</p>`;

    c.sections.forEach(function (s) {
      html += `<h4>${esc(s.h)}</h4>`;
      if (s.p)    s.p.forEach(function (para) { html += `<p>${esc(para)}</p>`; });
      if (s.list) {
        html += '<ul class="case__list">';
        s.list.forEach(function (item) { html += `<li>${esc(item)}</li>`; });
        html += '</ul>';
      }
      // code blocks carry intentional <b> markup, so they are inserted as authored
      if (s.code) html += `<pre class="case__code">${s.code}</pre>`;
    });

    html += '<h4>Built with</h4><ul class="case__stack">';
    c.stack.forEach(function (t) { html += `<li>${esc(t)}</li>`; });
    html += '</ul>';

    if (c.live) {
      html += `<a class="case__link" href="${c.live}" target="_blank" rel="noopener">Try the live demo</a>`;
    }

    if (c.download) {
      html += `<a class="case__link" href="${c.download}" target="_blank" rel="noopener">Download the app</a>`;
    }

    if (c.repo) {
      html += `<a class="case__link" href="${c.repo}" target="_blank" rel="noopener">View the code on GitHub</a>`;
    }

    html += '</article>';
    return html;
  }

  function openCase(key) {
    lastFocused = document.activeElement;
    modalBody.innerHTML = buildCase(key);
    modal.hidden = false;
    // force a reflow so the transform transition runs
    void modal.offsetWidth;
    modal.dataset.open = 'true';
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal__close').focus();
  }

  function closeCase() {
    modal.dataset.open = 'false';
    document.body.style.overflow = '';
    const done = function () {
      modal.hidden = true;
      modalBody.innerHTML = '';
    };
    if (reduceMotion) done();
    else setTimeout(done, 420);
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-project]').forEach(function (card) {
    card.addEventListener('click', function () { openCase(card.dataset.project); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCase(card.dataset.project);
      }
    });
  });

  modal.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', closeCase);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.dataset.open === 'true') closeCase();

    // keep focus inside the panel while it is open
    if (e.key === 'Tab' && modal.dataset.open === 'true') {
      const focusables = modal.querySelectorAll('button, a[href], input, textarea, select');
      if (!focusables.length) return;
      const first = focusables[0];
      const last  = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* -------------------------------------------------------
     Scroll reveals

     Three rules keep this from reading as an effect:
       1. Anything already visible at load is marked "instant"
          and never animates — you cannot reveal something the
          visitor is already reading.
       2. Siblings stagger by 60ms so a group arrives as a
          sequence rather than a slab.
       3. Each element is unobserved once revealed, so nothing
          re-animates on scroll back up.
     ------------------------------------------------------- */

  const REVEAL_GROUPS = [
    '.section__head',
    '.entry',
    '.about__body > p',
    '.about__side .fact',
    '.record__row',
    '.form .field',
    '.form .btn',
    '.contact__direct'
  ];

  const revealEls = [];
  REVEAL_GROUPS.forEach(function (selector) {
    const found = Array.prototype.slice.call(document.querySelectorAll(selector));
    found.forEach(function (el, i) {
      // stagger is scoped per group, and capped so long lists
      // never leave the last item waiting
      el.style.setProperty('--reveal-delay', Math.min(i, 5) * 60 + 'ms');
      revealEls.push(el);
    });
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.dataset.reveal = 'instant'; });
  } else {
    const fold = window.innerHeight;

    revealEls.forEach(function (el) {
      // already on screen at load — show it immediately, no animation
      if (el.getBoundingClientRect().top < fold * 0.92) {
        el.dataset.reveal = 'instant';
      } else {
        el.dataset.reveal = 'out';
      }
    });

    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.dataset.reveal = 'in';
        revealObserver.unobserve(el);
        // drop the compositor hint once the transition has finished,
        // so we are not holding a GPU layer for every element on the page
        setTimeout(function () { el.style.willChange = 'auto'; }, 800);
      });
    }, {
      // start slightly before the element reaches the viewport edge,
      // so it is already settling by the time it is properly in view
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08
    });

    revealEls.forEach(function (el) {
      if (el.dataset.reveal === 'out') {
        el.style.willChange = 'opacity, transform';
        revealObserver.observe(el);
      }
    });
  }

  /* -------------------------------------------------------
     Masthead state, rail progress, active section
     ------------------------------------------------------- */

  const masthead = document.querySelector('.masthead');
  const progress = document.getElementById('railProgress');
  const marks    = document.querySelectorAll('.rail__marks li');
  const sections = ['top', 'work', 'about', 'record', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  let ticking = false;

  function onScroll() {
    const y      = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;

    masthead.dataset.scrolled = y > 8 ? 'true' : 'false';

    if (progress) {
      progress.style.height = Math.min(100, (y / Math.max(height, 1)) * 100) + '%';
    }

    // active section = last one whose top is above the midpoint of the viewport
    let activeId = sections.length ? sections[0].id : null;
    sections.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= window.innerHeight * 0.42) activeId = sec.id;
    });
    marks.forEach(function (m) {
      m.dataset.active = m.dataset.mark === activeId ? 'true' : 'false';
    });

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* -------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------- */

  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  navToggle.addEventListener('click', function () {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    mobileNav.hidden = open;
  });

  mobileNav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navToggle.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
    });
  });

  /* -------------------------------------------------------
     Strip counters — part of the page-load sequence, runs once
     ------------------------------------------------------- */

  if (!reduceMotion) {
    document.querySelectorAll('.count').forEach(function (el, i) {
      const target = parseInt(el.dataset.to, 10);
      if (isNaN(target)) return;
      let current = 0;
      el.textContent = '0';
      setTimeout(function () {
        const step = setInterval(function () {
          current += 1;
          el.textContent = String(current);
          if (current >= target) clearInterval(step);
        }, 70);
      }, 620 + i * 90);
    });
  }

  /* -------------------------------------------------------
     Contact form
     ------------------------------------------------------- */

  const form   = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submit = document.getElementById('submitBtn');

  function setError(inputId, message) {
    const input = document.getElementById(inputId);
    const field = input.closest('.field');
    const slot  = document.getElementById('err-' + inputId);
    field.dataset.invalid = message ? 'true' : 'false';
    if (slot) slot.textContent = message || '';
    return !message;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name    = document.getElementById('fname').value.trim();
    const email   = document.getElementById('femail').value.trim();
    const message = document.getElementById('fmessage').value.trim();

    let ok = true;
    ok = setError('fname', name ? '' : 'Enter your name so I know who I am replying to.') && ok;
    ok = setError('femail',
      !email ? 'Enter an email address.'
             : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? 'That address does not look right — check for a typo.'
             : '') && ok;
    ok = setError('fmessage', message.length >= 10 ? '' : 'Add a little more detail, at least a sentence.') && ok;

    if (!ok) {
      status.dataset.state = 'bad';
      status.textContent = 'Fix the fields marked above, then send again.';
      return;
    }

    // No backend is wired up, so this hands off to the visitor's mail client.
    // Swap this block for a fetch() to Formspree, Netlify Forms or your own
    // endpoint when you have one — see README.
    const subject = document.getElementById('fsubject').value;
    const body    = 'From: ' + name + ' (' + email + ')\n\n' + message;

    window.location.href = 'mailto:bakri20041@outlook.com'
      + '?subject=' + encodeURIComponent(subject)
      + '&body='    + encodeURIComponent(body);

    submit.disabled = true;
    status.dataset.state = 'ok';
    status.textContent = 'Opening your email app with the message ready to send.';

    setTimeout(function () {
      submit.disabled = false;
      status.textContent = '';
      status.removeAttribute('data-state');
      form.reset();
    }, 6000);
  });

  // clear an error as soon as the visitor starts fixing it
  ['fname', 'femail', 'fmessage'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () {
      if (this.closest('.field').dataset.invalid === 'true') setError(id, '');
    });
  });

})();
