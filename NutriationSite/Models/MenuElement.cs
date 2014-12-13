using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace NutriationSite.Models
{
    public class MenuElement
    {
        public string text { get; set; }
        public string view { get; set; }
        public string controller { get; set; }
        public bool currentView { get; set; }
    }


    public class MenuCollection
    {
        List<MenuElement> _itemsList;
        public List<MenuElement> ItemsList
        {
            get { return _itemsList; }
        }

        public MenuCollection()
        {
            _itemsList = new List<MenuElement>(){
                new MenuElement{text = "Home", view = "Index", controller = "Home", currentView = false},
                new MenuElement{text = "About", view = "About", controller = "Home", currentView = false},
                new MenuElement{text = "Contact", view = "Contact", controller = "Home", currentView = false}
            };
        }

        public MenuCollection(IEnumerable<MenuElement> elements)
        {
            _itemsList = elements.ToList();
        }
        public bool SetCurrent(string view, string controller)
        {
            var a = from i in _itemsList where i.view == view && i.controller == controller select i;
            if (a.Count() < 1 || a == null)
            {
                return false;
            }
            else
            {
                _itemsList.ForEach(i => i.currentView = false);
                a.First().currentView = true;
                return true;
            }
        }

        public void ResetCurrent()
        {
            _itemsList.ForEach(i => i.currentView = false);
        }
    }
}