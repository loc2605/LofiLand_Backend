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
        avatarUrl: "https://i.pravatar.cc/150?img=2",
        country: "VN",
        debutYear: 2012,
      },
      {
        name: "Bích Phương",
        bio: "Ca sĩ Ballad/Pop nổi tiếng",
        avatarUrl: "https://i.pravatar.cc/150?img=3",
        country: "VN",
        debutYear: 2009,
      },
      {
        name: "Đen Vâu",
        bio: "Rapper, nhạc sĩ underground nổi tiếng",
        avatarUrl: "https://i.pravatar.cc/150?img=4",
        country: "VN",
        debutYear: 2010,
      },
      {
        name: "Erik",
        bio: "Ca sĩ Pop nổi tiếng",
        avatarUrl: "https://i.pravatar.cc/150?img=5",
        country: "VN",
        debutYear: 2013,
      },
      {
        name: "Hoàng Thùy Linh",
        bio: "Ca sĩ Pop/R&B",
        avatarUrl: "https://i.pravatar.cc/150?img=6",
        country: "VN",
        debutYear: 2007,
      },
    ]);

    // ==== TẠO ALBUM ====
    const albums = await Album.create([
      {
        title: "Sky Tour",
        coverUrl: "https://picsum.photos/200?random=1",
        artist: artists[0]._id,
        releaseDate: new Date("2023-01-01"),
      },
      {
        title: "Điều Anh Biết",
        coverUrl: "https://picsum.photos/200?random=2",
        artist: artists[1]._id,
        releaseDate: new Date("2022-05-01"),
      },
      {
        title: "Lối Nhỏ",
        coverUrl: "https://picsum.photos/200?random=3",
        artist: artists[2]._id,
        releaseDate: new Date("2021-08-01"),
      },
      {
        title: "Anh Ta Bỏ Em Rồi",
        coverUrl: "https://picsum.photos/200?random=4",
        artist: artists[3]._id,
        releaseDate: new Date("2022-11-01"),
      },
      {
        title: "Duyên Âm",
        coverUrl: "https://picsum.photos/200?random=5",
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
      { title: "Anh Ta Bỏ Em Rồi", duration: 230, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", coverUrl: albums[3].coverUrl, artist: artists[3]._id, album: albums[3]._id },
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