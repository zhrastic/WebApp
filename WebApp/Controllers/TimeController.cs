using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Web.Http;

namespace WebApp.Controllers
{
    public class TimeController : ApiController
    {
        [Route("api/time/getTime")]
        public DateTimeMessage GetTime()
        {
            DateTimeMessage msg = new DateTimeMessage();

            Thread.Sleep(3000); //namjerno usporavam da se vidi čekanje...

            msg.TekstPoruke = "Web Api request";
            msg.DateTimeValue = DateTime.Now.ToString();

            return msg;
        }
    }
}
