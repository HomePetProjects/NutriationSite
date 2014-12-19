using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NutriationSite.Models;
using Newtonsoft.Json;
using System.Globalization;

namespace NutriationSite.Controllers
{
    public class HomeController : Controller
    {
        NutriationContext _nutrContext = new NutriationContext();
        UsersContext _usContext = new UsersContext();

        public ActionResult Index()
        {
            if (Request.IsAuthenticated)
            {
                ViewBag.ParamValue = _nutrContext.ParameterValues;
                if(User.Identity.Name != null)
                {
                    int id = (from a in _usContext.UserProfiles where a.UserName == User.Identity.Name select a.UserId).First();
                    return View(_nutrContext.Parameters.Where(e => e.User_Id == id));
                }
                return View();
            }
            else return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your app description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public string DeleteChart()
        {
            int id = Convert.ToInt32(Request.Params["id"]);
            _nutrContext.Parameters.Remove(_nutrContext.Parameters.Where(e => e.Id == id).First());
            _nutrContext.SaveChanges();
            return "";
        }

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult AddValue(int Parameter_Id, double Value, string Comment)
        {
            ParameterValue par = new ParameterValue();
            par.Value = Value;
            par.Comment = Comment;
            par.DateTime = DateTime.Now;
            par.Parameter_Id = Parameter_Id;
            _nutrContext.ParameterValues.Add(par);
            _nutrContext.SaveChanges();
            return new EmptyResult();
        }

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult EditValue(int Id, double Value, string Date, string Comment)
        {
            DateTime date = Convert.ToDateTime(Date);
            ParameterValue pValue = _nutrContext.ParameterValues.Where(i => i.Id == Id).First();
            pValue.Value = Value;
            pValue.DateTime = date;
            pValue.Comment = Comment;
            _nutrContext.SaveChanges();
            return new EmptyResult();
        }

        [HttpPost]
        public ActionResult DeleteValue(int id)
        {
            ParameterValue value = _nutrContext.ParameterValues.Where(i => i.Id == id).First();
            _nutrContext.ParameterValues.Remove(value);
            _nutrContext.SaveChanges();
            return new EmptyResult();
        }

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult AddParameter(Parameter param)
        {
            param.User_Id = (from a in _usContext.UserProfiles where a.UserName == User.Identity.Name select a.UserId).First();
            if (param.Measure_Unit == null) param.Measure_Unit = "Unit";
            _nutrContext.Parameters.Add(param);
            _nutrContext.SaveChanges();

            return RedirectToAction("Index");
        }

        //This action return all charts
        public string GetCharts()
        {
            int id = (from a in _usContext.UserProfiles where a.UserName == User.Identity.Name select a.UserId).First();
            List<Parameter> paramList = _nutrContext.Parameters.Where(e => e.User_Id == id).ToList();

            List<object> anonList = new List<object>();
            foreach(var i in paramList)
            {
                ParameterValue[] arr = (from a in _nutrContext.ParameterValues where a.Parameter_Id == i.Id select a).OrderBy(j => j.DateTime).ToArray();
                List<Object> anonValueList = new List<object>();
                foreach (var j in arr)
                {
                    anonValueList.Add(new { 
                        Id = j.Id,
                        DateTime = j.DateTime.ToString("dd.MM.yyyy HH:mm"),
                        Value = j.Value, 
                        Comment = j.Comment, 
                        Parameter_Id = j.Parameter_Id });
                }
                anonList.Add(new { Parameter = new { Id = i.Id, Name = i.Name, Measure_Unit = i.Measure_Unit, User_Id = i.User_Id }, ValueArr = anonValueList.ToArray() });
            }

            string json = JsonConvert.SerializeObject(anonList);
            return json;
        }

        //This action return one chart
        public string GetChart(int id)
        {
            Parameter param = _nutrContext.Parameters.Where(e => e.Id == id).First();

            ParameterValue[] arr = (from a in _nutrContext.ParameterValues where a.Parameter_Id == id select a).OrderBy(i => i.DateTime).ToArray();
            List<Object> anonValueList = new List<object>();
            foreach (var j in arr)
            {
                anonValueList.Add(new
                {
                    Id = j.Id,
                    DateTime = j.DateTime.ToString("dd.MM.yyyy HH:mm"),
                    Value = j.Value,
                    Comment = j.Comment,
                    Parameter_Id = j.Parameter_Id
                });
            }

            object paramObj = new
            {
                Parameter = new
                {
                    Id = param.Id,
                    Name = param.Name,
                    Measure_Unit = param.Measure_Unit,
                    User_Id = param.User_Id
                },
                ValueArr = anonValueList.ToArray()
            };

            string json = JsonConvert.SerializeObject(paramObj);
            return json;
        }

        [HttpPost]
        public string GetMealsByDate(string date)
        {
            DateTime dt = ConvertJsDate(date);
            var list = _nutrContext.Meals.Select(e => new { Id = e.Id, Product = e.Product });

            string json = JsonConvert.SerializeObject(list);
            return json;
        }

        private DateTime ConvertJsDate(string jsDate)
        {
            string formatString = "ddd MMM d yyyy HH:mm:ss";

            var gmtIndex = jsDate.IndexOf(" GMT");
            if (gmtIndex > -1)
            {
                jsDate = jsDate.Remove(gmtIndex);
                return DateTime.ParseExact(jsDate, formatString, null);
            }
            return DateTime.Parse(jsDate);
        }
    }
}
