//------------------------------------------------------------------------------
// <auto-generated>
//    Этот код был создан из шаблона.
//
//    Изменения, вносимые в этот файл вручную, могут привести к непредвиденной работе приложения.
//    Изменения, вносимые в этот файл вручную, будут перезаписаны при повторном создании кода.
// </auto-generated>
//------------------------------------------------------------------------------

namespace NutriationSite.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class MeasureUnit
    {
        public MeasureUnit()
        {
            this.Product = new HashSet<Product>();
        }
    
        public int Id { get; set; }
        public string MeasUnit { get; set; }
    
        public virtual ICollection<Product> Product { get; set; }
    }
}
