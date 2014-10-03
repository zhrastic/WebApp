using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Microsoft.AspNet.SignalR;
using Newtonsoft.Json;
using System.Threading.Tasks;
using System.Collections.Concurrent;

namespace WebApp
{
    public class MessageHub : Hub
    {
        private MessageHubBroadcaster _broadcaster;

        public static ConcurrentDictionary<string, MyUserType> MyUsers = new ConcurrentDictionary<string, MyUserType>();

        public MessageHub() : this(MessageHubBroadcaster.Instance)
        {

        }

        public MessageHub(MessageHubBroadcaster instanca)
        {
            //Samo inicijalizira singleton koji u određenom timeru poziva određene procedure koje provjeravaju ima li poruka za push klijentu
            _broadcaster = instanca;
        }

        public void Login(string userName, string password)
        {
            //Služi za logiranje, ali trebalo bi izvesti sa kolekcijom usera i spojiti usera i ConnectionId i to u OnConnected()
            //http://www.asp.net/signalr/overview/guide-to-the-api/mapping-users-to-connections
            Groups.Add(Context.ConnectionId, "SviLogirani");
            var msg = new NotifyMessage() { MessageType = MessageType.LoginDone.ToString() };
            Clients.Caller.LoginDone(msg);
        }

        public override Task OnConnected()
        {
            MyUsers.TryAdd(Context.ConnectionId, new MyUserType() { ConnectionId = Context.ConnectionId, UserName = Context.User.Identity.Name});
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            MyUserType garbage;
            MyUsers.TryRemove(Context.ConnectionId, out garbage);
            Groups.Remove(Context.ConnectionId, "SviLogirani");
            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            // Add your own code here.
            // For example: in a chat application, you might have marked the
            // user as offline after a period of inactivity; in that case 
            // mark the user as online again.
            return base.OnReconnected();
        }

    }


    /// <summary>
    /// Singleton koji pokreće jobove za određeni hub -> MessageHub
    /// </summary>
    public class MessageHubBroadcaster
    {
        private static readonly Lazy<MessageHubBroadcaster> _instance = new Lazy<MessageHubBroadcaster>(() => new MessageHubBroadcaster());
        private readonly TimeSpan _broadcastInterval = TimeSpan.FromMilliseconds(20000);
        private readonly IHubContext _hubContext;
        private Timer _broadcastLoop;
        private bool _modelUpdated;
        private List<Action<IHubContext>> actionList;


        public MessageHubBroadcaster()
        {
            // Save our hub context so we can easily use it 
            // to send to its connected clients
            _hubContext = GlobalHost.ConnectionManager.GetHubContext<MessageHub>();
            

            //Lista Actiona (void sa parametrom IHubContext) koji će se izvršiti ponavljajućem intervalu 
            actionList = new List<Action<IHubContext>>();
            var akcije = new Akcije();


            actionList.Add(akcije.ObavijestiSveDatum);
            actionList.Add(akcije.ObavijestiRandomUsera);

            // Start the broadcast loop
            _broadcastLoop = new Timer( BroadcastRunCheck, null, _broadcastInterval, _broadcastInterval);
        }

        public static MessageHubBroadcaster Instance
        {
            get
            {
                return _instance.Value;
            }
        }

        public void BroadcastRunCheck(object state)
        {
            foreach (var action in actionList)
            {
                action(_hubContext); 
            } 
        }
    }

    public class MyUserType
    {
        public string ConnectionId { get; set; }
        public string UserName { get; set; }
    } 

    public class NotifyMessage
    {
        public string MessageType;
        public object MessageObject;
        public bool HasError = false;
        public object ErrorMessage;
        public DateTime ServerskoVrijeme;

        public NotifyMessage()
        {
            ServerskoVrijeme = DateTime.Now;
        }

    }

    public class Akcije
    {
        public void ObavijestiSveDatum(IHubContext hubContext)
        {
            var msg = new NotifyMessage() { MessageType = MessageType.DateTimeMessage.ToString() };
            var poruka = new DateTimeMessage() { TekstPoruke = "SignalR svima javlja", DateTimeValue = DateTime.Now.ToString() };
            msg.MessageObject = poruka;
            hubContext.Clients.Group("SviLogirani").notifyAll(msg);
        }

        public void ObavijestiRandomUsera(IHubContext hubContext)
        {
            if (MessageHub.MyUsers.Count > 0)
            {
                Random rnd = new Random();
                int i = rnd.Next(1, MessageHub.MyUsers.Count) - 1;
                var chosen = MessageHub.MyUsers.ElementAt(i);
                var chosenClient = chosen.Value as MyUserType;
                var msg = new NotifyMessage() { MessageType = MessageType.DateTimeMessage.ToString() };
                var poruka = new DateTimeMessage() { TekstPoruke = string.Format("SignalR javlja samo tebi {0}", chosenClient.UserName), DateTimeValue = DateTime.Now.ToString() };
                msg.MessageObject = poruka;
                hubContext.Clients.Client(chosenClient.ConnectionId).notifyMe(msg);
            }
        }
    }


    public class DateTimeMessage
    {
        public string TekstPoruke;
        public string DateTimeValue;
    }

    public class ErrorMessage
    {
        public string Message;
        public string Details;
    }

    public enum MessageType
    {
        DateTimeMessage,
        JobDone,
        LoginDone
    }

}