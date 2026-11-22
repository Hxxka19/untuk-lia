
import { supabase } from './supabase.js';

// ======================================
// 1. MASUK KE WEBSITE
// ======================================

function openWebsite() {
  document.getElementById('welcome').classList.add('hidden');
  document.getElementById('main').classList.remove('hidden');
  document.getElementById('musicButton').classList.remove('hidden');

  window.scrollTo(0, 0);

  const music = document.getElementById('bgMusic');

  music.play()
    .then(() => {
      document.getElementById('musicButton').textContent = '♫';
    })
    .catch(() => {
      document.getElementById('musicButton').textContent = '▶';
    });
}

// ======================================
// 2. MUSIK
// ======================================

function toggleMusic() {
  const music = document.getElementById('bgMusic');
  const button = document.getElementById('musicButton');

  if (music.paused) {
    music.play()
      .then(() => button.textContent = '♫')
      .catch(() => alert('Periksa file musik kamu.'));
  } else {
    music.pause();
    button.textContent = '▶';
  }
}

// ======================================
// 3. ANIMASI HATI
// ======================================

const hearts = ['❤️', '💕', '💗', '💖', '♡'];

function createHeart() {
  const heart = document.createElement('div');

  heart.className = 'heart';
  heart.textContent =
    hearts[Math.floor(Math.random() * hearts.length)];

  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.fontSize = (12 + Math.random() * 18) + 'px';
  heart.style.animationDuration = (5 + Math.random() * 5) + 's';

  document.body.appendChild(heart);

  setTimeout(() => heart.remove(), 10000);
}

setInterval(createHeart, 700);

// ======================================
// 4. MEMBUAT KARTU FOTO
// ======================================

function createPhotoCard(imageURL, caption) {
  const gallery = document.getElementById('galleryContainer');

  const card = document.createElement('div');
  card.className = 'photo-card';

  const img = document.createElement('img');
  img.src = imageURL;
  img.alt = 'Foto kenangan';
  img.onclick = () => zoomImage(imageURL);

  const text = document.createElement('p');
  text.textContent = caption || 'Our special moment ♡';

  card.appendChild(img);
  card.appendChild(text);

  gallery.appendChild(card);
}

// ======================================
// 5. AMBIL FOTO DARI SUPABASE
// ======================================

async function loadSupabasePhotos() {
  const gallery = document.getElementById('galleryContainer');

  const { data, error } = await supabase
    .from('photos')
    .select('id, caption, storage_path')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Gagal mengambil foto:', error.message);
    return;
  }

  data.forEach(photo => {
    const { data: imageData } = supabase
      .storage
      .from('gallery')
      .getPublicUrl(photo.storage_path);

    // Jangan menampilkan foto yang sama dua kali
    if (gallery.querySelector(`[data-photo-id="${photo.id}"]`)) {
      return;
    }

    const card = document.createElement('div');
    card.className = 'photo-card';
    card.dataset.photoId = photo.id;

    const img = document.createElement('img');
    img.src = imageData.publicUrl;
    img.alt = 'Foto kenangan';
    img.onclick = () => zoomImage(imageData.publicUrl);

    const text = document.createElement('p');
    text.textContent = photo.caption || 'Our special moment ♡';

    card.appendChild(img);
    card.appendChild(text);

    gallery.appendChild(card);
  });
}

// ======================================
// 6. UPLOAD FOTO KE SUPABASE
// ======================================


async function addPhotos(event) {
  const input = event.target;
  const files = Array.from(input.files || []);

  if (!files.length) return;

  const button = document.querySelector('.add-photo');
  button.disabled = true;
  button.textContent = 'Mengunggah foto...';

  try {
    for (const file of files) {

      if (!file.type.startsWith('image/')) {
        throw new Error('File harus berupa gambar.');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error(file.name + ' melebihi batas 5 MB.');
      }

      const filePath =
        `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`;

      // Upload ke Storage
      const { error: uploadError } = await supabase
        .storage
        .from('gallery')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Simpan informasi ke database
      const { data: photo, error: dbError } = await supabase
        .from('photos')
        .insert({
          caption: 'Our special moment ♡',
          storage_path: filePath
        })
        .select()
        .single();

      if (dbError) {
        await supabase.storage
          .from('gallery')
          .remove([filePath]);

        throw dbError;
      }

      // Ambil URL foto
      const { data: imageData } = supabase
        .storage
        .from('gallery')
        .getPublicUrl(filePath);

      // Tampilkan di galeri
      const card = document.createElement('div');
      card.className = 'photo-card';
      card.dataset.photoId = photo.id;

      const img = document.createElement('img');
      img.src = imageData.publicUrl;
      img.alt = 'Foto kenangan';
      img.onclick = () => zoomImage(imageData.publicUrl);

      const caption = document.createElement('p');
      caption.textContent = photo.caption;

      card.appendChild(img);
      card.appendChild(caption);

      document.getElementById('galleryContainer')
        .appendChild(card);
    }

    alert('Semua foto berhasil disimpan! ❤️');

  } catch (error) {
    console.error('UPLOAD ERROR:', error);
    alert('Upload gagal: ' + error.message);

  } finally {
    button.disabled = false;
    button.textContent = '+ Tambahkan Foto';
    input.value = '';
  }
}

// ======================================
// 7. ZOOM FOTO
// ======================================

function zoomImage(src) {
  document.getElementById('lightboxImage').src = src;
  document.getElementById('lightbox').style.display = 'flex';
}

function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
}

// ======================================
// 8. MEMBUKA SURAT
// ======================================

function openLetter() {
  const envelope = document.getElementById('envelope');
  const content = document.getElementById('letterContent');

  envelope.classList.toggle('open');

  if (content.style.display === 'block') {
    content.style.display = 'none';
  } else {
    content.style.display = 'block';

    setTimeout(() => {
      content.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  }
}

// ======================================
// 9. RESPONS PASANGAN
// ======================================

function showResponse(type) {
  const response = document.getElementById('response');

  response.style.display = 'block';

  if (type === 'forgive') {
    response.textContent =
      'Terima kasih sudah berikan sa kesempatan. ' +
      'Sa akan berusaha jaga kepercayaan dan ko pu perasaan. ❤️';
  } else {
    response.textContent =
      'Tidak apa-apa, Lia. Sa hargai ko pu perasaan. ' +
      'Ambil waktu yang ko butuhkan. 🤍';
  }

  response.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
}

// ======================================
// 10. HUBUNGKAN FUNGSI KE HTML
// ======================================

window.openWebsite = openWebsite;
window.toggleMusic = toggleMusic;
window.addPhotos = addPhotos;
window.zoomImage = zoomImage;
window.closeLightbox = closeLightbox;
window.openLetter = openLetter;
window.showResponse = showResponse;

// ======================================
// 11. JALANKAN WEBSITE
// ======================================

document.addEventListener('DOMContentLoaded', () => {
  loadSupabasePhotos();
});

console.log('For Lia berhasil terhubung ke main.js ❤️');
window.addPhotos = addPhotos;