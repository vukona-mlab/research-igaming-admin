import "./NotificationCard.css";

const NotificationCard = ({ notification }) => {
  console.log({ notification });
  return (
    <div className="NotificationCard">
      <div className="nc-header">
        <div className="nc-title">{notification.title}</div>
        <div className="nc-time">
          {notification.date && notification.date._seconds}
        </div>
      </div>
      <div className="nc-body">{notification.body}</div>
      <div className="nc-ref">{notification.id}</div>
    </div>
  );
};
export default NotificationCard;
