using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace NutriationSite.Models
{
    public class ParameterContext : DbContext
    {
        public ParameterContext() : base("NutriationDB") { }
        public DbSet<Parameter> Parameter { get; set; }
        public DbSet<ParameterValue> ParameterValues { get; set; }
    }

}