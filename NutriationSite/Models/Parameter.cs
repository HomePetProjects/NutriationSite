//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace NutriationSite.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Parameter
    {
        public Parameter()
        {
            this.ParameterValues = new HashSet<ParameterValue>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public string Measure_Unit { get; set; }
        public int User_Id { get; set; }
    
        public virtual ICollection<ParameterValue> ParameterValues { get; set; }
    }
}
