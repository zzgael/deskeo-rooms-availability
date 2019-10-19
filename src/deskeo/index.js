export default async function fetchAvailabilityByRoomName(config, callback) {
  const response = await fetch("https://deskeo.idmkr.io/salles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8"
    },
    body: JSON.stringify(config)
  });
  const { reservations, rooms } = await response.json();
  callback();
  const roomsById = getRoomsById(rooms);
  let reservationsByRoomId = getReservationsHoursByRoomId(reservations);
  return getAvailabilityByRoomNameFromReservations(
    reservationsByRoomId,
    roomsById
  );
}

function getRoomsById(rooms) {
  let roomsById = {};
  rooms.forEach(room => {
    roomsById[room.id] = room;
  });
  return roomsById;
}

function getFormattedTime(dateString) {
  const pad = s => String("0" + s).slice(-2);
  const date = new Date(dateString);
  return pad(date.getHours()) + ":" + pad(date.getMinutes());
}

function getReservationsHoursByRoomId(reservations) {
  const reservationsByRoomId = {};
  reservations.forEach(reservation => {
    if (typeof reservationsByRoomId[reservation.roomId] === "undefined") {
      reservationsByRoomId[reservation.roomId] = [];
    }
    reservationsByRoomId[reservation.roomId].push({
      start: getFormattedTime(reservation.start),
      end: getFormattedTime(reservation.end)
    });
  });
  orderReservationsByHour(reservationsByRoomId);
  return reservationsByRoomId;
}

function getAvailabilityByRoomNameFromReservations(
  reservationsByRoomId,
  roomsById
) {
  let availabilityByRoomName = {};
  Object.keys(reservationsByRoomId).forEach(roomId => {
    let availability = [];
    const reservations = reservationsByRoomId[roomId];
    const reservationRanges = [
      {
        start: roomsById[roomId].openingHour,
        end: roomsById[roomId].openingHour
      },
      ...reservations,
      {
        start: roomsById[roomId].closingHour,
        end: roomsById[roomId].closingHour
      }
    ];
    console.log(reservationRanges);
    reservationRanges.forEach((reservation, i) => {
      const nextReservation = reservationRanges[i + 1];
      if (typeof nextReservation === "undefined") {
        return;
      }
      if (reservation.end !== nextReservation.start) {
        availability.push({
          start: reservation.end,
          end: nextReservation.start
        });
      }
    });
    availabilityByRoomName[roomsById[roomId].name] = availability;
  });
  return availabilityByRoomName;
}

function orderReservationsByHour(reservations) {
  Object.keys(reservations).forEach(roomid => {
    reservations[roomid].sort((a, b) => a.start.localeCompare(b.start));
  });
}
