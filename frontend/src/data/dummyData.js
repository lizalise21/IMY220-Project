export const currentUser = {
  id: "1",
  username: "liza.codes",
  displayName: "Liza",
  bio: "Second-year IKS student. Coffee, code, film photography.",
  avatar: "https://i.pravatar.cc/150?img=47",
  followers: 128,
  following: 96,
};

export const dummyUsers = [
  {
    id: "2",
    username: "thabo_shoots",
    displayName: "Thabo M.",
    bio: "Street photography, Joburg.",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "3",
    username: "naledi.k",
    displayName: "Naledi K.",
    bio: "Sunsets and film grain.",
    avatar: "https://i.pravatar.cc/150?img=32",
  },
  {
    id: "4",
    username: "sipho_dev",
    displayName: "Sipho N.",
    bio: "CS student, hobbyist photographer.",
    avatar: "https://i.pravatar.cc/150?img=8",
  },
];

export const dummyPosts = [
  {
    id: "101",
    author: dummyUsers[0],
    image: "https://picsum.photos/id/1015/600/600",
    caption: "Morning light over the city.",
    likes: 42,
    comments: [
      { id: "c1", author: dummyUsers[1], text: "Gorgeous shot!" },
      { id: "c2", author: currentUser, text: "Wow, the colours 😍" },
    ],
    createdAt: "2026-08-28T09:12:00Z",
  },
  {
    id: "102",
    author: dummyUsers[1],
    image: "https://picsum.photos/id/1025/600/600",
    caption: "New puppy, who dis.",
    likes: 87,
    comments: [{ id: "c3", author: dummyUsers[2], text: "So cute!" }],
    createdAt: "2026-08-27T18:45:00Z",
  },
  {
    id: "103",
    author: dummyUsers[2],
    image: "https://picsum.photos/id/1005/600/600",
    caption: "Late night lab session.",
    likes: 15,
    comments: [],
    createdAt: "2026-08-26T22:03:00Z",
  },
];
