import "./NotificationCard.css";

const NotificationCard = ({ notification }) => {
  console.log({ notification });
  let sec = Math.floor(
    (new Date() - new Date(notification.date._seconds * 1000)) / 1000
  );
  let interval = sec / 3600;

  return (
    <div className="NotificationCard">
      <div className="nc-header">
        <div className="nc-title">{notification.title}</div>
        <div className="nc-time">
          {notification.date && Math.floor(interval) + " hours ago"}
        </div>
      </div>
      <div className="nc-body">{notification.body}</div>
      <div className="nc-ref">REF:{notification.id}</div>
    </div>
  );
};
export default NotificationCard;
