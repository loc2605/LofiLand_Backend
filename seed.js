import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Artist from "./models/Artist.js";
import Album from "./models/Album.js";
import Song from "./models/Song.js";

dotenv.config();
connectDB();

const seedData = async () => {
  try {
    await Artist.deleteMany();
    await Album.deleteMany();
    await Song.deleteMany();

    // ==== TẠO ARTIST ====
    const artists = await Artist.create([
      {
        name: "Sơn Tùng M-TP",
        bio: "Ca sĩ, nhạc sĩ nổi tiếng và đẹp trai Việt Nam",
        avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Son_Tung_M-TP_1_%282021%29.png/500px-Son_Tung_M-TP_1_%282021%29.png",
        country: "VN",
        debutYear: 2012,
      },
      {
        name: "Bích Phương",
        bio: "Ca sĩ Ballad/Pop nổi tiếng",
        avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/BICH_PHUONG_-_VIETTEL%2B%2B.jpg/375px-BICH_PHUONG_-_VIETTEL%2B%2B.jpg",
        country: "VN",
        debutYear: 2009,
      },
      {
        name: "Đen Vâu",
        bio: "Rapper, nhạc sĩ underground nổi tiếng",
        avatarUrl: "https://cdn-web.onlive.vn/onlive/image-news/%C4%91en%20v%C3%A2u.png",
        country: "VN",
        debutYear: 2010,
      },
      {
        name: "Erik",
        bio: "Ca sĩ Pop nổi tiếng",
        avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/8/83/Erik_t%E1%BA%A1i_s%E1%BB%B1_ki%E1%BB%87n%2C_2020-03-21.png",
        country: "VN",
        debutYear: 2013,
      },
      {
        name: "Hoàng Thùy Linh",
        bio: "Ca sĩ Pop/R&B",
        avatarUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd3g5J41U7A_HU_lS1KdkE8ux8YBw61aZhgw&s",
        country: "VN",
        debutYear: 2007,
      },
    ]);

    // ==== TẠO ALBUM ====
    const albums = await Album.create([
      {
        title: "Sky Tour",
        coverUrl: "https://upload.wikimedia.org/wikipedia/vi/c/c2/Skytour2020.jpg",
        artist: artists[0]._id,
        releaseDate: new Date("2023-01-01"),
      },
      {
        title: "Dramatic",
        coverUrl: "https://upload.wikimedia.org/wikipedia/vi/thumb/7/75/Dramatic-Bich-Phuong.jpg/375px-Dramatic-Bich-Phuong.jpg",
        artist: artists[1]._id,
        releaseDate: new Date("2022-05-01"),
      },
      {
        title: "Lối Nhỏ",
        coverUrl: "https://i1.sndcdn.com/artworks-hnafgjxy6MNeF3fx-aXrfdg-t500x500.jpg",
        artist: artists[2]._id,
        releaseDate: new Date("2021-08-01"),
      },
      {
        title: "Anh Ta Bỏ Em Rồi",
        coverUrl: "https://photo-resize-zmp3.zadn.vn/w600_r1x1_jpeg/cover/d/3/4/b/d34b167ca36dcb3ee02f1a902ea57c57.jpg",
        artist: artists[3]._id,
        releaseDate: new Date("2022-11-01"),
      },
      {
        title: "Duyên Âm",
        coverUrl: "https://photo-resize-zmp3.zadn.vn/w600_r1x1_jpeg/cover/b/a/4/9/ba4968da9191e8dfcb07719dfca80b60.jpg",
        artist: artists[4]._id,
        releaseDate: new Date("2023-03-01"),
      },
    ]);

    // ==== TẠO SONGS ====
    const songs = [
      { title: "Chúng Ta Của Hiện Tại", duration: 210, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", coverUrl: albums[0].coverUrl, artist: artists[0]._id, album: albums[0]._id },
      { title: "Hãy Trao Cho Anh", duration: 250, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", coverUrl: albums[0].coverUrl, artist: artists[0]._id, album: albums[0]._id },
      { title: "Bùa Yêu", duration: 200, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", coverUrl: albums[1].coverUrl, artist: artists[1]._id, album: albums[1]._id },
      { title: "Đi Đu Đưa Đi", duration: 180, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", coverUrl: albums[1].coverUrl, artist: artists[1]._id, album: albums[1]._id },
      { title: "Lối Nhỏ", duration: 220, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", coverUrl: albums[2].coverUrl, artist: artists[2]._id, album: albums[2]._id },
      { title: "Đưa Nhau Đi Trốn", duration: 210, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", coverUrl: albums[2].coverUrl, artist: artists[2]._id, album: albums[2]._id },
      { title: "Ghen", duration: 200, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", coverUrl: albums[3].coverUrl, artist: artists[3]._id, album: albums[3]._id },
      { title: "Duyên Âm", duration: 210, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", coverUrl: albums[4].coverUrl, artist: artists[4]._id, album: albums[4]._id },
      { title: "See Tình", duration: 180, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", coverUrl: albums[4].coverUrl, artist: artists[4]._id, album: albums[4]._id },
    ];

    await Song.create(songs);

    console.log("Data seeded successfully!");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedData();