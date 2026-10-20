
document.addEventListener("DOMContentLoaded", () => {
    // =========================
// TRANSISI PERPINDAHAN HALAMAN
// =========================

document.addEventListener("DOMContentLoaded", () => {
    // Animasi saat pengunjung mengeklik tautan halaman
    document.querySelectorAll("a[href]").forEach(link => {
        link.addEventListener("click", event => {
            const url = new URL(link.href, window.location.href);

            // Abaikan tautan eksternal, tab baru, dan anchor
            if (
                url.origin !== window.location.origin ||
                link.target === "_blank" ||
                link.hasAttribute("download") ||
                url.pathname === window.location.pathname &&
                url.search === window.location.search &&
                url.hash
            ) {
                return;
            }

            // Abaikan klik dengan tombol mouse selain kiri
            if (event.button !== 0 ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                event.metaKey) {
                return;
            }

            // Jangan animasikan URL yang sama
            if (url.href === window.location.href) {
                return;
            }

            event.preventDefault();

            document.body.classList.add("fade-out");

            setTimeout(() => {
                window.location.href = url.href;
            }, 300);
        });
    });
});

  // =========================
  // NAVIGASI RESPONSIF
  // =========================
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.textContent = isOpen ? "✕" : "☰";
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
      });
    });
  }

  // Halaman Home tidak membutuhkan fungsi rekap.
  const studentForm = document.getElementById("studentForm");
  if (!studentForm) return;

  // =========================
  // PENYIMPANAN DATA
  // =========================
  const STORAGE_KEY = "studentData_mahasiswa";

  function loadStudents() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved === null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
        return [...demoData];
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        throw new Error("Format data tidak valid.");
      }

      return parsed;
    } catch (error) {
      console.error("Gagal membaca data:", error);
      return [];
    }
  }

  let students = loadStudents();
  let editingId = null;

  const totalElement = document.getElementById("totalMahasiswa");
  const averageElement = document.getElementById("rataRata");
  const studentList = document.getElementById("studentList");
  const emptyMessage = document.getElementById("emptyMessage");
  const searchInput = document.getElementById("searchStudent");
  const formTitle = document.getElementById("formTitle");
  const submitBtn = document.getElementById("submitBtn");
  const cancelEdit = document.getElementById("cancelEdit");
  const formMessage = document.getElementById("formMessage");
  const namaInput = document.getElementById("nama");
  const nimInput = document.getElementById("nim");
  const nilaiInput = document.getElementById("nilai");

  // =========================
  // UTILITAS
  // =========================
  function saveStudents() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      return true;
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      showMessage("Data gagal disimpan di browser.", true);
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function formatScore(value) {
    return Number(value).toLocaleString("id-ID", {
      maximumFractionDigits: 2
    });
  }

  function showMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.classList.toggle("error", isError);
  }

  // =========================
  // STATISTIK
  // =========================
  function renderStats() {
    totalElement.textContent = students.length;

    const totalNilai = students.reduce(
      (sum, student) => sum + Number(student.nilai), 0
    );

    const average = students.length
      ? totalNilai / students.length
      : 0;

    averageElement.textContent = average.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  // =========================
  // DAFTAR MAHASISWA
  // =========================
  function renderStudents() {
    const keyword = searchInput.value.trim().toLowerCase();

    const filtered = students.filter(student =>
      student.nama.toLowerCase().includes(keyword) ||
      student.nim.toLowerCase().includes(keyword)
    );

    studentList.innerHTML = filtered.map(student => `
      <tr>
        <td>
          <span class="student-name">
            ${escapeHTML(student.nama)}
          </span>
          <span class="student-nim">
            ${escapeHTML(student.nim)}
          </span>
        </td>
        <td>
          <span class="score">
            ${formatScore(student.nilai)}
          </span>
        </td>
        <td>
          <div class="actions">
            <button type="button"
              class="action-btn edit-btn"
              data-action="edit"
              data-id="${escapeHTML(student.id)}"
              aria-label="Edit ${escapeHTML(student.nama)}"
              title="Edit">✎</button>

            <button type="button"
              class="action-btn delete-btn"
              data-action="delete"
              data-id="${escapeHTML(student.id)}"
              aria-label="Hapus ${escapeHTML(student.nama)}"
              title="Hapus">♜</button>
          </div>
        </td>
      </tr>
    `).join("");

    emptyMessage.classList.toggle("hidden", filtered.length > 0);

    if (filtered.length === 0 && keyword) {
      emptyMessage.textContent = "Mahasiswa tidak ditemukan.";
    } else {
      emptyMessage.textContent =
        "Belum ada data mahasiswa. Silakan tambahkan data baru.";
    }

    renderStats();
  }

  // =========================
  // RESET FORM
  // =========================
  function resetForm() {
    studentForm.reset();
    editingId = null;

    formTitle.textContent = "Tambah Mahasiswa";
    submitBtn.textContent = "+ Tambah Data";
    cancelEdit.classList.add("hidden");

    showMessage("");
  }

  // =========================
  // TAMBAH DAN EDIT DATA
  // =========================
  studentForm.addEventListener("submit", event => {
    event.preventDefault();

    const nama = namaInput.value.trim();
    const nim = nimInput.value.trim();
    const nilai = Number(nilaiInput.value);

    if (!nama || !nim) {
      showMessage("Nama dan NIM wajib diisi.", true);
      return;
    }

    if (!Number.isFinite(nilai) || nilai < 0 || nilai > 100) {
      showMessage("Nilai harus berada di antara 0 dan 100.", true);
      return;
    }

    const duplicate = students.some(student =>
      student.nim.toLowerCase() === nim.toLowerCase() &&
      student.id !== editingId
    );

    if (duplicate) {
      showMessage("NIM sudah digunakan mahasiswa lain.", true);
      nimInput.focus();
      return;
    }

    const previousStudents = [...students];

    if (editingId !== null) {
      students = students.map(student =>
        student.id === editingId
          ? { ...student, nama, nim, nilai }
          : student
      );
    } else {
      students.push({
        id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
        nama,
        nim,
        nilai
      });
    }

    if (!saveStudents()) {
      students = previousStudents;
      renderStudents();
      return;
    }

    const message = editingId !== null
      ? "Data mahasiswa berhasil diperbarui."
      : "Mahasiswa berhasil ditambahkan.";

    resetForm();
    showMessage(message);
    renderStudents();
  });

  // =========================
  // TOMBOL EDIT DAN HAPUS
  // =========================
  studentList.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = button.dataset.id;
    const student = students.find(item => item.id === id);

    if (!student) return;

    if (button.dataset.action === "edit") {
      editingId = id;

      namaInput.value = student.nama;
      nimInput.value = student.nim;
      nilaiInput.value = student.nilai;

      formTitle.textContent = "Edit Mahasiswa";
      submitBtn.textContent = "Simpan Perubahan";
      cancelEdit.classList.remove("hidden");
      showMessage("");

      studentForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      namaInput.focus();
    }

    if (button.dataset.action === "delete") {
      const confirmed = confirm(
        `Apakah kamu yakin ingin menghapus ${student.nama}?`
      );

      if (!confirmed) return;

      const previousStudents = [...students];
      students = students.filter(item => item.id !== id);

      if (!saveStudents()) {
        students = previousStudents;
        renderStudents();
        return;
      }

      if (editingId === id) resetForm();

      showMessage("Data mahasiswa berhasil dihapus.");
      renderStudents();
    }
  });

  // =========================
  // BATAL EDIT
  // =========================
  cancelEdit.addEventListener("click", resetForm);

  // =========================
  // PENCARIAN
  // =========================
  searchInput.addEventListener("input", renderStudents);

  // Tampilkan data saat halaman pertama dibuka.
  renderStudents();
  document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");

  const links = document.querySelectorAll("a");

  links.forEach(link => {
    link.addEventListener("click", function(e) {
      const targetUrl = this.getAttribute("href");

      if (targetUrl && targetUrl.endsWith(".html")) {
        e.preventDefault(); 

        document.body.classList.remove("fade-in");

        setTimeout(() => {
          window.location.href = targetUrl;
        }, 500);
      }
    });
  });
});
});