let users = [];

const addUser = ({ id, name, room }) => {
  if (!name || !room) return { error: "name and room required" };
  const user = { id, name, room };
  users.push(user);
  return { user };
};

const userCount = (roomId) => {
  return new Set(
    users.filter((user) => user.room == roomId).map((user) => user.name)
  ).size;
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  var user = index != -1 ? users[index] : null;
  if (user) {
    users = users.filter((x) => x.id != user.id);
  }
  return user;
};

module.exports = {
  addUser,
  userCount,
  removeUser,
};

