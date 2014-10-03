using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace WebApp
{
    class JObjectConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType == typeof(JObject);
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            writer.WriteRawValue(((JObject)value).ToString(Formatting.None));
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            if (reader.TokenType == JsonToken.Null || reader.TokenType == JsonToken.None)
            {
                return null;
            }

            return JObject.Load(reader);
        }
    }

    public class JsonSerializationProvider
    {
        public static string Serialize(object obj)
        {
            if (null == obj)
            {
                return string.Empty;
            }

            return JsonConvert.SerializeObject(obj, Formatting.Indented, GetConverters());
        }

        public static string Serialize(JObject jobj)
        {
            if (null == jobj)
            {
                return string.Empty;
            }

            return jobj.ToString(Formatting.None, GetConverters());
        }

        public static T Deserialize<T>(string json)
        {
            return JsonConvert.DeserializeObject<T>(json, GetConverters());
        }

        public static object Deserialize(string json, Type type)
        {
            return JsonConvert.DeserializeObject(json, type, GetConverters());
        }

        public static JObject FromObject(object obj)
        {
            return JObject.FromObject(obj, JsonSerializer.Create(new JsonSerializerSettings
            {
                Converters = GetConverters()
            }));
        }

        public static JsonConverter[] GetConverters()
        {
            IsoDateTimeConverter isoDateTimeConverter = new IsoDateTimeConverter();
            isoDateTimeConverter.DateTimeFormat = "yyyyMMddHHmmss";

            return new JsonConverter[] { new JObjectConverter(), isoDateTimeConverter };
        }
    }

}