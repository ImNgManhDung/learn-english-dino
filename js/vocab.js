// Kho từ vựng tiếng Anh thông dụng theo chủ đề & Thuật toán tạo Hint (X..., B...)

export const VOCAB_TOPICS = [
  { id: 'all', name: 'ALL SECTORS // Tất cả chủ đề', icon: '' },
  { id: 'animals', name: 'BIO-FAUNA // Động vật & Tự nhiên', icon: '' },
  { id: 'food', name: 'NUTRITION // Ẩm thực & Trái cây', icon: '' },
  { id: 'actions', name: 'KINETICS // Hành động hàng ngày', icon: '' },
  { id: 'school', name: 'ACADEMY // Học tập & Công việc', icon: '' },
  { id: 'tech', name: 'CYBERNETICS // Công nghệ & Đời sống', icon: '' },
  { id: 'adjectives', name: 'SYNAPSE // Tính từ & Cảm xúc', icon: '' }
];

export const VOCAB_LIST = [
  // Động vật & Tự nhiên (animals)
  { word: 'DINOSAUR', meaning: 'Khủng long', pos: 'n', phonetic: '/ˈdaɪ.nə.sɔːr/', topic: 'animals' },
  { word: 'BUTTERFLY', meaning: 'Con bướm', pos: 'n', phonetic: '/ˈbʌt.ər.flaɪ/', topic: 'animals' },
  { word: 'ELEPHANT', meaning: 'Con voi', pos: 'n', phonetic: '/ˈel.ɪ.fənt/', topic: 'animals' },
  { word: 'DOLPHIN', meaning: 'Cá heo', pos: 'n', phonetic: '/ˈdɒl.fɪn/', topic: 'animals' },
  { word: 'VOLCANO', meaning: 'Núi lửa', pos: 'n', phonetic: '/vɒlˈkeɪ.nəʊ/', topic: 'animals' },
  { word: 'RAINBOW', meaning: 'Cầu vồng', pos: 'n', phonetic: '/ˈreɪn.bəʊ/', topic: 'animals' },
  { word: 'FOREST', meaning: 'Khu rừng', pos: 'n', phonetic: '/ˈfɒr.ɪst/', topic: 'animals' },
  { word: 'TIGER', meaning: 'Con hổ', pos: 'n', phonetic: '/ˈtaɪ.ɡər/', topic: 'animals' },
  { word: 'RABBIT', meaning: 'Con thỏ', pos: 'n', phonetic: '/ˈræb.ɪt/', topic: 'animals' },
  { word: 'EAGLE', meaning: 'Đại bàng', pos: 'n', phonetic: '/ˈiː.ɡəl/', topic: 'animals' },
  { word: 'MONKEY', meaning: 'Con khỉ', pos: 'n', phonetic: '/ˈmʌŋ.ki/', topic: 'animals' },
  { word: 'OCEAN', meaning: 'Đại dương', pos: 'n', phonetic: '/ˈəʊ.ʃən/', topic: 'animals' },
  { word: 'DESERT', meaning: 'Sa mạc', pos: 'n', phonetic: '/ˈdez.ət/', topic: 'animals' },
  { word: 'PENGUIN', meaning: 'Chim cánh cụt', pos: 'n', phonetic: '/ˈpeŋ.ɡwɪn/', topic: 'animals' },
  { word: 'GIRAFFE', meaning: 'Hươu cao cổ', pos: 'n', phonetic: '/dʒɪˈrɑːf/', topic: 'animals' },
  { word: 'ZEBRA', meaning: 'Ngựa vằn', pos: 'n', phonetic: '/ˈzeb.rə/', topic: 'animals' },
  { word: 'KANGAROO', meaning: 'Chuột túi', pos: 'n', phonetic: '/ˌkæŋ.ɡəˈruː/', topic: 'animals' },
  { word: 'CROCODILE', meaning: 'Cá sấu', pos: 'n', phonetic: '/ˈkrɒk.ə.daɪl/', topic: 'animals' },
  { word: 'MOUNTAIN', meaning: 'Ngọn núi', pos: 'n', phonetic: '/ˈmaʊn.tɪn/', topic: 'animals' },
  { word: 'THUNDER', meaning: 'Sấm sét', pos: 'n', phonetic: '/ˈθʌn.dər/', topic: 'animals' },

  // Ẩm thực & Trái cây (food)
  { word: 'BANANA', meaning: 'Quả chuối', pos: 'n', phonetic: '/bəˈnɑː.nə/', topic: 'food' },
  { word: 'APPLE', meaning: 'Quả táo', pos: 'n', phonetic: '/ˈæp.əl/', topic: 'food' },
  { word: 'ORANGE', meaning: 'Quả cam', pos: 'n', phonetic: '/ˈɒr.ɪndʒ/', topic: 'food' },
  { word: 'WATERMELON', meaning: 'Dưa hấu', pos: 'n', phonetic: '/ˈwɔː.təˌmel.ən/', topic: 'food' },
  { word: 'STRAWBERRY', meaning: 'Dâu tây', pos: 'n', phonetic: '/ˈstrɔː.bər.i/', topic: 'food' },
  { word: 'PINEAPPLE', meaning: 'Quả dứa', pos: 'n', phonetic: '/ˈpaɪnˌæp.əl/', topic: 'food' },
  { word: 'CHOCOLATE', meaning: 'Sô-cô-la', pos: 'n', phonetic: '/ˈtʃɒk.lət/', topic: 'food' },
  { word: 'BREAKFAST', meaning: 'Bữa sáng', pos: 'n', phonetic: '/ˈbrek.fəst/', topic: 'food' },
  { word: 'SANDWICH', meaning: 'Bánh mì kẹp', pos: 'n', phonetic: '/ˈsæn.wɪdʒ/', topic: 'food' },
  { word: 'NOODLE', meaning: 'Mì sợi', pos: 'n', phonetic: '/ˈnuː.dəl/', topic: 'food' },
  { word: 'COFFEE', meaning: 'Cà phê', pos: 'n', phonetic: '/ˈkɒf.i/', topic: 'food' },
  { word: 'AVOCADO', meaning: 'Quả bơ', pos: 'n', phonetic: '/ˌæv.əˈkɑː.dəʊ/', topic: 'food' },
  { word: 'BROCCOLI', meaning: 'Bông cải xanh', pos: 'n', phonetic: '/ˈbrɒk.əl.i/', topic: 'food' },
  { word: 'CUCUMBER', meaning: 'Dưa chuột', pos: 'n', phonetic: '/ˈkjuː.kʌm.bər/', topic: 'food' },
  { word: 'TOMATO', meaning: 'Cà chua', pos: 'n', phonetic: '/təˈmɑː.təʊ/', topic: 'food' },
  { word: 'BISCUIT', meaning: 'Bánh quy', pos: 'n', phonetic: '/ˈbɪs.kɪt/', topic: 'food' },
  { word: 'HONEY', meaning: 'Mật ong', pos: 'n', phonetic: '/ˈhʌn.i/', topic: 'food' },
  { word: 'CHEESE', meaning: 'Phô mai', pos: 'n', phonetic: '/tʃiːz/', topic: 'food' },

  // Hành động hàng ngày (actions)
  { word: 'EXPLORE', meaning: 'Khám phá', pos: 'v', phonetic: '/ɪkˈsplɔːr/', topic: 'actions' },
  { word: 'PROTECT', meaning: 'Bảo vệ', pos: 'v', phonetic: '/prəˈtekt/', topic: 'actions' },
  { word: 'DISCOVER', meaning: 'Phát hiện ra', pos: 'v', phonetic: '/dɪˈskʌv.ər/', topic: 'actions' },
  { word: 'LISTEN', meaning: 'Lắng nghe', pos: 'v', phonetic: '/ˈlɪs.ən/', topic: 'actions' },
  { word: 'CREATE', meaning: 'Sáng tạo', pos: 'v', phonetic: '/kriˈeɪt/', topic: 'actions' },
  { word: 'TRAVEL', meaning: 'Du lịch', pos: 'v', phonetic: '/ˈtræv.əl/', topic: 'actions' },
  { word: 'PRACTICE', meaning: 'Luyện tập', pos: 'v', phonetic: '/ˈpræk.tɪs/', topic: 'actions' },
  { word: 'REMEMBER', meaning: 'Ghi nhớ', pos: 'v', phonetic: '/rɪˈmem.bər/', topic: 'actions' },
  { word: 'CELEBRATE', meaning: 'Ăn mừng', pos: 'v', phonetic: '/ˈsel.ə.breɪt/', topic: 'actions' },
  { word: 'IMAGINE', meaning: 'Tưởng tượng', pos: 'v', phonetic: '/ɪˈmædʒ.ɪn/', topic: 'actions' },
  { word: 'IMPROVE', meaning: 'Cải thiện', pos: 'v', phonetic: '/ɪmˈpruːv/', topic: 'actions' },
  { word: 'ACHIEVE', meaning: 'Đạt được', pos: 'v', phonetic: '/əˈtʃiːv/', topic: 'actions' },
  { word: 'DECIDE', meaning: 'Quyết định', pos: 'v', phonetic: '/dɪˈsaɪd/', topic: 'actions' },
  { word: 'PREPARE', meaning: 'Chuẩn bị', pos: 'v', phonetic: '/prɪˈpeər/', topic: 'actions' },
  { word: 'BELIEVE', meaning: 'Tin tưởng', pos: 'v', phonetic: '/bɪˈliːv/', topic: 'actions' },
  { word: 'SUPPORT', meaning: 'Hỗ trợ', pos: 'v', phonetic: '/səˈpɔːt/', topic: 'actions' },

  // Học tập & Công việc (school)
  { word: 'KNOWLEDGE', meaning: 'Kiến thức', pos: 'n', phonetic: '/ˈnɒl.ɪdʒ/', topic: 'school' },
  { word: 'XYLOPHONE', meaning: 'Đàn mộc cầm', pos: 'n', phonetic: '/ˈzaɪ.lə.fəʊn/', topic: 'school' },
  { word: 'LIBRARY', meaning: 'Thư viện', pos: 'n', phonetic: '/ˈlaɪ.brər.i/', topic: 'school' },
  { word: 'DICTIONARY', meaning: 'Từ điển', pos: 'n', phonetic: '/ˈdɪk.ʃən.ər.i/', topic: 'school' },
  { word: 'NOTEBOOK', meaning: 'Quyển vở', pos: 'n', phonetic: '/ˈnəʊt.bʊk/', topic: 'school' },
  { word: 'SCIENCE', meaning: 'Khoa học', pos: 'n', phonetic: '/ˈsaɪ.əns/', topic: 'school' },
  { word: 'HISTORY', meaning: 'Lịch sử', pos: 'n', phonetic: '/ˈhɪs.tər.i/', topic: 'school' },
  { word: 'LANGUAGE', meaning: 'Ngôn ngữ', pos: 'n', phonetic: '/ˈlæŋ.ɡwɪdʒ/', topic: 'school' },
  { word: 'QUESTION', meaning: 'Câu hỏi', pos: 'n', phonetic: '/ˈkwes.tʃən/', topic: 'school' },
  { word: 'SOLUTION', meaning: 'Giải pháp', pos: 'n', phonetic: '/səˈluː.ʃən/', topic: 'school' },
  { word: 'RESEARCH', meaning: 'Nghiên cứu', pos: 'n', phonetic: '/rɪˈsɜːtʃ/', topic: 'school' },
  { word: 'SCHEDULE', meaning: 'Lịch trình', pos: 'n', phonetic: '/ˈʃed.juːl/', topic: 'school' },
  { word: 'PROJECT', meaning: 'Dự án', pos: 'n', phonetic: '/ˈprɒdʒ.ekt/', topic: 'school' },
  { word: 'TEACHER', meaning: 'Giáo viên', pos: 'n', phonetic: '/ˈtiː.tʃər/', topic: 'school' },
  { word: 'STUDENT', meaning: 'Học sinh', pos: 'n', phonetic: '/ˈstjuː.dənt/', topic: 'school' },
  { word: 'CHALLENGE', meaning: 'Thử thách', pos: 'n', phonetic: '/ˈtʃæl.ɪndʒ/', topic: 'school' },

  // Công nghệ & Đời sống (tech)
  { word: 'COMPUTER', meaning: 'Máy tính', pos: 'n', phonetic: '/kəmˈpjuː.tər/', topic: 'tech' },
  { word: 'KEYBOARD', meaning: 'Bàn phím', pos: 'n', phonetic: '/ˈkiː.bɔːd/', topic: 'tech' },
  { word: 'INTERNET', meaning: 'Mạng Internet', pos: 'n', phonetic: '/ˈɪn.tə.net/', topic: 'tech' },
  { word: 'SOFTWARE', meaning: 'Phần mềm', pos: 'n', phonetic: '/ˈsɒft.weər/', topic: 'tech' },
  { word: 'BATTERY', meaning: 'Cục pin', pos: 'n', phonetic: '/ˈbæt.ər.i/', topic: 'tech' },
  { word: 'NETWORK', meaning: 'Mạng lưới', pos: 'n', phonetic: '/ˈnet.wɜːk/', topic: 'tech' },
  { word: 'ROBOTICS', meaning: 'Công nghệ Robot', pos: 'n', phonetic: '/rəʊˈbɒt.ɪks/', topic: 'tech' },
  { word: 'XRAY', meaning: 'Tia X-quang', pos: 'n', phonetic: '/ˈeks.reɪ/', topic: 'tech' },
  { word: 'CAMERA', meaning: 'Máy ảnh', pos: 'n', phonetic: '/ˈkæm.rə/', topic: 'tech' },
  { word: 'SCREEN', meaning: 'Màn hình', pos: 'n', phonetic: '/skriːn/', topic: 'tech' },
  { word: 'MESSAGE', meaning: 'Tin nhắn', pos: 'n', phonetic: '/ˈmes.ɪdʒ/', topic: 'tech' },
  { word: 'SECURITY', meaning: 'Bảo mật', pos: 'n', phonetic: '/sɪˈkjʊə.rə.ti/', topic: 'tech' },
  { word: 'DATABASE', meaning: 'Cơ sở dữ liệu', pos: 'n', phonetic: '/ˈdeɪ.tə.beɪs/', topic: 'tech' },
  { word: 'SPEAKER', meaning: 'Cái loa', pos: 'n', phonetic: '/ˈspiː.kər/', topic: 'tech' },
  { word: 'ROCKET', meaning: 'Tên lửa', pos: 'n', phonetic: '/ˈrɒk.ɪt/', topic: 'tech' },
  { word: 'COMPASS', meaning: 'La bàn', pos: 'n', phonetic: '/ˈkʌm.pəs/', topic: 'tech' },

  // Tính từ & Cảm xúc (adjectives)
  { word: 'BRILLIANT', meaning: 'Xuất sắc / Rực rỡ', pos: 'adj', phonetic: '/ˈbrɪl.jənt/', topic: 'adjectives' },
  { word: 'BRAVE', meaning: 'Dũng cảm', pos: 'adj', phonetic: '/breɪv/', topic: 'adjectives' },
  { word: 'CREATIVE', meaning: 'Sáng tạo', pos: 'adj', phonetic: '/kriˈeɪ.tɪv/', topic: 'adjectives' },
  { word: 'CAREFUL', meaning: 'Cẩn thận', pos: 'adj', phonetic: '/ˈkeə.fəl/', topic: 'adjectives' },
  { word: 'EXCITED', meaning: 'Hào hứng', pos: 'adj', phonetic: '/ɪkˈsaɪ.tɪd/', topic: 'adjectives' },
  { word: 'FRIENDLY', meaning: 'Thân thiện', pos: 'adj', phonetic: '/ˈfrend.li/', topic: 'adjectives' },
  { word: 'GENEROUS', meaning: 'Hào phóng', pos: 'adj', phonetic: '/ˈdʒen.ər.əs/', topic: 'adjectives' },
  { word: 'HONEST', meaning: 'Trung thực', pos: 'adj', phonetic: '/ˈɒn.ɪst/', topic: 'adjectives' },
  { word: 'PATIENT', meaning: 'Kiên nhẫn', pos: 'adj', phonetic: '/ˈpeɪ.ʃənt/', topic: 'adjectives' },
  { word: 'POWERFUL', meaning: 'Mạnh mẽ', pos: 'adj', phonetic: '/ˈpaʊə.fəl/', topic: 'adjectives' },
  { word: 'PEACEFUL', meaning: 'Bình yên', pos: 'adj', phonetic: '/ˈpiːs.fəl/', topic: 'adjectives' },
  { word: 'WONDERFUL', meaning: 'Tuyệt vời', pos: 'adj', phonetic: '/ˈwʌn.də.fəl/', topic: 'adjectives' },
  { word: 'CURIOUS', meaning: 'Tò mò / Hiếu kỳ', pos: 'adj', phonetic: '/ˈkjʊə.ri.əs/', topic: 'adjectives' },
  { word: 'GRATEFUL', meaning: 'Biết ơn', pos: 'adj', phonetic: '/ˈɡreɪt.fəl/', topic: 'adjectives' },
  { word: 'CONFIDENT', meaning: 'Tự tin', pos: 'adj', phonetic: '/ˈkɒn.fɪ.dənt/', topic: 'adjectives' },
  { word: 'ANCIENT', meaning: 'Cổ đại', pos: 'adj', phonetic: '/ˈeɪn.ʃənt/', topic: 'adjectives' }
];

/**
 * Lọc từ vựng theo chủ đề và độ dài
 */
export function getWordsByTopic(topic = 'all', minLen = 1, maxLen = 20) {
  return VOCAB_LIST.filter(item => {
    const matchTopic = topic === 'all' || item.topic === topic;
    const matchLen = item.word.length >= minLen && item.word.length <= maxLen;
    return matchTopic && matchLen;
  });
}

/**
 * Tạo tập hợp các vị trí chữ cái được lộ sẵn làm gợi ý (Hint: B _ _ _ _ A hoặc X _ _ _ _)
 * @param {string} word Từ tiếng Anh viết hoa
 * @param {'easy'|'medium'|'hard'} hintMode Chế độ gợi ý người chơi chọn
 * @param {number} wave Đợt tấn công hiện tại
 * @returns {Set<number>} Tập các index được gợi ý
 */
export function generateHintIndices(word, hintMode = 'medium', wave = 1) {
  const indices = new Set();
  const len = word.length;
  if (len === 0) return indices;

  // Luôn lộ chữ cái đầu tiên (VD: X..., B...)
  indices.add(0);

  if (hintMode === 'easy') {
    // Chế độ Dễ: Lộ chữ đầu, chữ cuối và ~35% chữ cái ở giữa
    if (len > 2) indices.add(len - 1);
    const extraCount = Math.max(1, Math.floor((len - 2) * 0.35));
    const step = Math.max(2, Math.floor(len / (extraCount + 1)));
    for (let i = step; i < len - 1; i += step) {
      indices.add(i);
    }
  } else if (hintMode === 'medium') {
    // Chế độ Vừa: Wave thấp lộ chữ cuối hoặc 1 chữ giữa; Wave cao chỉ lộ chữ đầu + 1 chữ nếu từ dài
    if (wave <= 2 && len >= 5) {
      indices.add(len - 1);
    }
    if (len >= 6) {
      const midIndex = Math.floor(len / 2);
      indices.add(midIndex);
    }
  } else {
    // Chế độ Khó (Hard): Chỉ lộ đúng chữ cái đầu tiên (VD: B _ _ _ _ _, X _ _ _ _ _ _ _ _)
    // Nếu từ cực dài (>= 9 ký tự), lộ thêm 1 ký tự cuối
    if (len >= 9) {
      indices.add(len - 1);
    }
  }

  return indices;
}

/**
 * Trả về mảng trạng thái từng ký tự của từ để render lên đầu khủng long và thanh HUD
 * Mỗi phần tử: { char: string, display: string, state: 'typed' | 'hint' | 'hidden', isNext: boolean }
 */
export function formatMaskedWord(word, typedIndex, revealedIndices) {
  const result = [];
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    if (i < typedIndex) {
      result.push({
        char: ch,
        display: ch,
        state: 'typed',
        isNext: false
      });
    } else if (revealedIndices && revealedIndices.has(i)) {
      result.push({
        char: ch,
        display: ch,
        state: 'hint',
        isNext: i === typedIndex
      });
    } else {
      result.push({
        char: ch,
        display: '_',
        state: 'hidden',
        isNext: i === typedIndex
      });
    }
  }
  return result;
}
