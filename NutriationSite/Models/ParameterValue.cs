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
    using System.ComponentModel.DataAnnotations;
    
    public partial class ParameterValue
    {
        public int Id { get; set; }
        public int Parameter_Id { get; set; }

        [Required(ErrorMessage = "�an not be empty")]
        public double Value { get; set; }
        public System.DateTime DateTime { get; set; }
        public string Comment { get; set; }
    
        public virtual Parameter Parameters { get; set; }
    }
}
