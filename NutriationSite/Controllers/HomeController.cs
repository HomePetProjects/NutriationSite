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
        public HomeController()
        {
            _nutrContext.Configuration.LazyLoadingEnabled = false;
        }

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
            int user_Id = (from a in _usContext.UserProfiles where a.UserName == User.Identity.Name select a.UserId).First();

            List<Meal> list = _nutrContext.Meals.Select(e => e).ToList();
            list = list.Where(e => e.Date.Date == dt.Date && e.UserId == user_Id).ToList();

            object[] outArr = new object[24];
            for(int i = 0; i < 24; i++)
            {
                List<Meal> arr = list.Where(e => e.Date.Hour == i).ToList();
                List<object> outElems = new List<object>();
                arr.ForEach(e => outElems.Add(new { Id = e.Id, ProductId = e.ProductId, Weight = e.Weight, Date = e.Date }));
                outArr[i] = outElems;
            }

            string json = JsonConvert.SerializeObject(outArr);
            return json;
        }

        [HttpPost]
        public string DeleteMeal(int id)
        {
            Meal meal = _nutrContext.Meals.Where(e => e.Id == id).First();
            if (meal != null)
            {
                _nutrContext.Meals.Remove(meal);
                _nutrContext.SaveChanges();
            }

            return "";
        }

        [HttpPost]
        public void AddMeal(int productId, double weight, string date)
        {
            Meal meal = new Meal();
            meal.Date = ConvertJsDate(date);
            meal.UserId = (from a in _usContext.UserProfiles where a.UserName == User.Identity.Name select a.UserId).First();
            meal.Weight = weight;
            meal.ProductId = productId;
            _nutrContext.Meals.Add(meal);
            _nutrContext.SaveChanges();
        }

        [HttpPost]
        public string GetProducts()
        {
            int user_Id = (from a in _usContext.UserProfiles 
                           where a.UserName == User.Identity.Name 
                           select a.UserId).First();
            List<Product> productList = _nutrContext.Products.Where(e => e.UserId == user_Id || e.Base == true).ToList();

            string json = JsonConvert.SerializeObject(productList);
            return json;
        }

        [HttpPost]
        public string AddProduct(string name, double calories, double proteins, double fats, double carbohydrates, int measureId)
        {
            Product prod = new Product();
            prod.Name = name;
            prod.Calories = calories;
            prod.Protein = proteins;
            prod.Fat = fats;
            prod.Carbohydrates = carbohydrates;
            prod.MeasureUnitId = measureId;
            prod.UserId = (from a in _usContext.UserProfiles 
                           where a.UserName == User.Identity.Name 
                           select a.UserId).First();

            _nutrContext.Products.Add(prod);
            _nutrContext.SaveChanges();

            return GetProducts();
        }

        [HttpPost]
        public string EditProduct(int id, string name, double calories, double proteins, double fats, double carbohydrates, int measureId)
        {
            Product prod = _nutrContext.Products.Where(e => e.Id == id).First();
            prod.Name = name;
            prod.Calories = calories;
            prod.Protein = proteins;
            prod.Fat = fats;
            prod.Carbohydrates = carbohydrates;
            prod.MeasureUnitId = measureId;
            prod.UserId = (from a in _usContext.UserProfiles
                           where a.UserName == User.Identity.Name
                           select a.UserId).First();

            _nutrContext.SaveChanges();

            return GetProducts();
        }

        [HttpPost]
        public string DeleteProduct(int id)
        {
            Product prod = _nutrContext.Products.Where(e => e.Id == id).First();
            _nutrContext.Products.Remove(prod);
            _nutrContext.SaveChanges();

            return GetProducts();
        }

        [HttpPost]
        public string GetMeasures()
        {
            List<MeasureUnit> measures = _nutrContext.MeasureUnits.Select(e => e).ToList();
            return JsonConvert.SerializeObject(measures);
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
