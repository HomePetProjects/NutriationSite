//Journal class
window.PN.journal = {

    products: Array(),
    foods: Array(),
    measures: Array(),

    init: function () {
        $.ajax({
            type: 'POST',
            url: "/Home/GetProducts",
            success: function (prod) {
                window.PN.journal.products = $.parseJSON(prod);
                $.ajax({
                    type: 'POST',
                    url: "/Home/GetMeasures",
                    success: function (measures) {
                        window.PN.journal.measures = $.parseJSON(measures);
                        window.PN.journal.journalMenu.init();
                    }
                });
            }
        })
        $('#hours-journal ul li').on('mouseover', window.PN.journal.journalBody.showAddBtn);
        $('#hours-journal ul li').on('mouseout', window.PN.journal.journalBody.hideAddBtn);
    },

    journalMenu: {
        //Property
        date: new Date(),

        init: function () {
            this.setMenuDatePicker();
            $('.day-btn-class').on('click', this.clickDateBtn);
        },

        setMenuDatePicker: function () {
            $('#date-peacker').datetimepicker({
                timepicker: false,
                format: 'd.m.Y',
                maxDate: 0,
                closeOnDateSelect: true,
                onChangeDateTime: function (dp, $input) {
                    var temp = $input.val().indexOf('.');
                    if (temp != '-1') {
                        var temp = $input.val().split('.');
                        var date = new Date(temp[2], temp[1] - 1, temp[0]);
                        window.PN.journal.journalMenu.date = date;
                        window.PN.journal.dateChanget();
                    }
                },
                onGenerate: function (ct) {
                    window.PN.journal.journalMenu.date = ct;
                    window.PN.journal.dateChanget();
                },
                onShow: function (dt) {
                    this.setOptions({
                        value: window.PN.journal.journalMenu.date
                    });
                },
            })
        },

        redrawDateMenu: function () {
            var date = window.PN.journal.journalMenu.date;
            var selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).valueOf();
            var day = 24 * 60 * 60 * 1000;

            var now = new Date();
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).valueOf();

            var d = new Date(selectedDate - day * 2);
            $('#day1').attr('value', d.getDate());
            var d = new Date(selectedDate - day);
            $('#day2').attr('value', d.getDate());
            var d = new Date(selectedDate);
            $('#day3').attr('value', d.getDate());
            var d = new Date(selectedDate + day);
            $('#day4').attr('value', d.getDate());
            var d = new Date(selectedDate + day * 2);
            $('#day5').attr('value', d.getDate());

            if (today == selectedDate) {
                $('#day4').css('display', 'none');
                $('#day5').css('display', 'none');
            }
            if (today - day == selectedDate) {
                $('#day4').css('display', 'inline-block');
                $('#day5').css('display', 'none');
            }
            else if (today - day * 2 == selectedDate) {
                $('#day4').css('display', 'inline-block');
                $('#day5').css('display', 'inline-block');
            }
        },

        clickDateBtn: function () {
            var day = 24 * 60 * 60 * 1000;
            if ($(this).attr('id') == 'day1')
                window.PN.journal.journalMenu.date = new Date(window.PN.journal.journalMenu.date.getTime() - day * 2);
            else if ($(this).attr('id') == 'day2')
                window.PN.journal.journalMenu.date = new Date(window.PN.journal.journalMenu.date.getTime() - day);
            else if ($(this).attr('id') == 'day4')
                window.PN.journal.journalMenu.date = new Date(window.PN.journal.journalMenu.date.getTime() + day);
            else if ($(this).attr('id') == 'day5')
                window.PN.journal.journalMenu.date = new Date(window.PN.journal.journalMenu.date.getTime() + day * 2);
            window.PN.journal.dateChanget();
        }
    },

    journalBody: {

        init: function () {
            this.getMeals();
        },

        redrawJournal: function () {
            var journal = window.PN.journal;
            $('#hourList li').empty();

            journal.journalBody.calcJornalPart();

            for (var i = 1; i <= journal.foods.length; i++) {
                $('#hour' + i).append(journal.journalBody.calculateOneHour(i - 1));
                $('#hour' + i).css('position', 'relative');
                $('#hour' + i).append('<div id="wrap" style="display:block; left:0px; text-align: center; position: absolute; width: 100%; bottom: 10px"><input type="Button" style="display: none; width: 20px; height: 20px; padding: 0px; font-size: 1em; margin:0px" value="+"></input></div>');
            }
            $('#hourList input').on('click', journal.viewProductsDialog);
        },

        calcJornalPart: function () {
            var padding = $('#hour1').css('padding').replace(/[^-\d\.]/g, '');
            padding = parseFloat(padding);
            var border = $('#hour1').css('border-right-width').replace(/[^-\d\.]/g, '');
            border = parseFloat(border);
            var NoActiveHourCount = 0;

            for (var i = 0; i < window.PN.journal.foods.length; i++) {
                if (window.PN.journal.foods[i].length == 0) NoActiveHourCount++;
            }

            var emptyWidth = 26;
            var fullWidth = (958 - (emptyWidth + padding * 2 + border) * NoActiveHourCount) / -(NoActiveHourCount - 24) - (padding * 2 + border);
            if (fullWidth > 60) {
                fullWidth = 60;
                emptyWidth = (958 - (fullWidth + padding * 2 + border) * -(NoActiveHourCount - 24)) / NoActiveHourCount - (padding * 2 + border);
            }

            if (NoActiveHourCount == 24) emptyWidth = 958 / 24 - (padding * 2 + border);

            for (var i = 1; i <= window.PN.journal.foods.length; i++) {
                if (window.PN.journal.foods[i - 1].length == 0) {
                    $('#hour' + i).css('width', emptyWidth);
                }
                else $('#hour' + i).css('width', fullWidth);
            }

            $('#hour24').css('border', '0px');
        },

        showAddBtn: function () {
            var currentHour = new Date().getHours();
            currentHour++;
            $('#hourList li').children('#wrap').children('input').hide();
            $('#hourList li').children('#hour-journal').hide();

            $(this).children('#hour-journal').show();
            $(this).children('#wrap').children('input').show();
        },

        hideAddBtn: function () {
            var currentHour = new Date().getHours();
            currentHour++;

            $(this).children('#hour-journal').hide();
            $(this).children('#wrap').children('input').hide();

            $('#hour' + currentHour).children('#wrap').children('input').show();
            $('#hour' + currentHour).children('#hour-journal').show();
            $('#hour' + currentHour).css('background-color', '#B2DFEE');
        },

        calculateOneHour: function (hour) {
            var Calories = 0;
            var Protein = 0;
            var Fat = 0;
            var Carbohydrates = 0;
            var foods = window.PN.journal.foods[hour];
            var products = window.PN.journal.products;

            if (window.PN.journal.foods[hour].length == 0) {
                return '<div id="hour-journal" style="display: none; width: 100%"><p style="font-weight:bold; text-align: center">' + hour + 'h</p><HR></div>';
            }

            for (var j = 0; j < foods.length; j++) {
                for (var k = 0; k < products.length; k++) {
                    if (foods[j].ProductId == products[k].Id) {
                        Calories += foods[j].Weight / 100 * products[k].Calories;
                        Protein += foods[j].Weight / 100 * products[k].Protein;
                        Fat += foods[j].Weight / 100 * products[k].Fat;
                        Carbohydrates += foods[j].Weight / 100 * products[k].Carbohydrates;
                    }
                }
            }

            Calories = +Calories.toFixed(2);
            Protein = +Protein.toFixed(2);
            Fat = +Fat.toFixed(2);
            Carbohydrates = +Carbohydrates.toFixed(2);

            return '<div><p style="font-weight:bold; text-align: center">' + hour + 'h</p><HR></div><div style="padding-left:3px"><p style="font-weight:bold">Calor.:</p><p>' + Calories + '</p><p style="font-weight:bold">Prot.:</p><p>' + Protein + '</p><p style="font-weight:bold">Fats:</p><p>' + Fat + '</p><p style="font-weight:bold">Carb.:</p><p>' + Carbohydrates + '</p></div>';
        },

        calculateOneDay: function () {
            $('#journal-day-resault').empty();

            var Calories = 0;
            var Protein = 0;
            var Fat = 0;
            var Carbohydrates = 0;
            var products = window.PN.journal.products;
            var foods = window.PN.journal.foods;

            for (var i = 0; i < 24; i++) {
                for (var j = 0; j < foods[i].length; j++) {
                    for (var k = 0; k < products.length; k++) {
                        if (foods[i][j].ProductId == products[k].Id) {
                            Calories += foods[i][j].Weight / 100 * products[k].Calories;
                            Protein += foods[i][j].Weight / 100 * products[k].Protein;
                            Fat += foods[i][j].Weight / 100 * products[k].Fat;
                            Carbohydrates += foods[i][j].Weight / 100 * products[k].Carbohydrates;
                        }
                    }
                }
            }

            Calories = +Calories.toFixed(2);
            Protein = +Protein.toFixed(2);
            Fat = +Fat.toFixed(2);
            Carbohydrates = +Carbohydrates.toFixed(2);
            $('#journal-day-resault').append('<p style="font-weight:bold">Total per day: </p><span style="font-weight:bold">Calories: </span><span>' + Calories + ', </span><span style="font-weight:bold">Proteins: </span><span>' + Protein + ', </span><span style="font-weight:bold">Fats: </span><span>' + Fat + ', </span><span style="font-weight:bold">Carbohydrates: </span><span>' + Carbohydrates + '</span>');

        },

        getMeals: function () {
            $.ajax({
                type: 'POST',
                url: "/Home/GetMealsByDate",
                data: { date: window.PN.journal.journalMenu.date },
                success: function (meals) {
                    window.PN.journal.foods = $.parseJSON(meals);
                    window.PN.journal.journalBody.redrawJournal();
                    window.PN.journal.journalBody.calculateOneDay();
                    window.PN.journal.journalBody.hideAddBtn();
                }
            })
        }
    },
    
    dateChanget: function () {
        window.PN.journal.journalMenu.redrawDateMenu();
        window.PN.journal.journalBody.getMeals();
    },

    getProducts: function () {
        $.ajax({
            type: 'POST',
            url: "/Home/GetProducts",
            success: function (prod) {
                window.PN.journal.products = $.parseJSON(prod);
            }
        })
    },

    viewProductsDialog: function () {
        var str = $(this).parent().parent().attr('id');
        str = str.substr(4, str.length - (str.length - 4));

        window.PN.journal.journalBody.currentHour = str - 1;

        $("li.item-a").parent()

        window.PN.journal.redrawProductDialog(str - 1);
        $("#view-products-dialog").dialog({
            title: "Products",
            modal: true,
            resizable: false,
            width: "300px",
            close: function (ev, ui) {
                window.PN.journal.journalBody.getMeals();
            },
            buttons: {
                Ok: function () {
                    $(this).dialog('close');
                }
            }
        })
    },

    redrawProductDialog: function (index) {
        $('#products-list').empty();
        var foods = window.PN.journal.foods[index];
        var prods = window.PN.journal.products;

        for (var i = 0; i < foods.length; i++) {
            for (var j = 0; j < prods.length; j++) {
                if (foods[i].ProductId == prods[j].Id) {
                    $('#products-list').append('<div><input type="button" style="width:20px; height:20px; padding:0px; font-size:1em" value="-" foodId="' + foods[i].Id + '"/><span> ' + prods[j].Name + '</span><span style="float:right">' + foods[i].Weight + ' mg</span></div>');
                    break;
                }
            }
        }

        $('#products-list input').on('click', window.PN.journal.deleteFood);
    },

    deleteFood: function () {
        var id = $(this).attr('foodId');
        $.ajax({
            type: 'POST',
            url: "/Home/DeleteMeal/",
            dataType: 'json',
            data: { id: id },
            success: function () {
                var foods = window.PN.journal.foods[window.PN.journal.journalBody.currentHour];
                for (var i = 0; i < foods.length; i++) {
                    if (foods[i].Id == id) {
                        foods.splice(i, 1);
                        break;
                    }
                }
                window.PN.journal.redrawProductDialog(window.PN.journal.journalBody.currentHour);
            },
            error: function (er) {
                alert(er.toString());
            }
        })
    }
}

//Dialog for add product

window.PN.AddProductDialog = {
    prods: Array(),

    init: function () {
        $('#open-add-product-dialog').on('click', window.PN.AddProductDialog.openAddProductsDialog);
    },

    openAddProductsDialog: function () {
        window.PN.AddProductDialog.setAutocomplit();

        $('#add-products-dialog #add-new-product').on('click', function () {
            window.PN.NewEditProductDialog.openDialog('new')
        });
        $('#add-products-dialog #edit-product').on('click', function () {
            var value = $('#add-products-dialog #serch-product').attr('value');
            var product = window.PN.AddProductDialog.productSelected(value);
            if (product != null){
                if (!product.Base) {
                    window.PN.NewEditProductDialog.openDialog('edit', product);
                }
            }
        });
        $('#add-products-dialog #delete-product').on('click', window.PN.AddProductDialog.deleteBtnClick);

        $("#add-products-dialog").dialog({
            title: 'Add foods',
            modal: true,
            resizable: false,
            width: 'auto',
            buttons: {
                Add: window.PN.AddProductDialog.addBtnClick,
                Close: function () {
                    $(this).dialog('close');
                }
            }
        })
    },

    setAutocomplit: function (prodStr) {
        prods = window.PN.journal.products;
        window.PN.AddProductDialog.resetWindow();

        var serchList = Array();

        for (var i = 0; i < prods.length; i++) {
            serchList[i] = prods[i].Name;
        }

        $('#serch-product').autocomplete({
            source: serchList,
            appendTo: $('#add-products-dialog'),
            select: function (ev, value) {
                window.PN.AddProductDialog.productSelected(value.item.label);
            }
        });

        if (prodStr != undefined) $('#add-products-dialog #serch-product').attr('value', prodStr);
    },

    productSelected: function (strValue) {
        prods = window.PN.journal.products;

        for (var i = 0; i < prods.length; i++) {
            if (prods[i].Name == strValue) {
                window.PN.AddProductDialog.selectedProduct = prods[i];
                return prods[i];
            }
        }
        return null;
    },

    resetWindow: function () {
        $('#add-products-dialog #weight').attr('value', '');
        $('#add-products-dialog #serch-product').attr('value', '');
        $('.validation-message').css('display', 'none');
    },

    deleteBtnClick: function () {
        var value = $('#add-products-dialog #serch-product').attr('value');
        var product = window.PN.AddProductDialog.productSelected(value);
        if (product != null) {
            if (!product.Base) {
                $.ajax({
                    type: 'POST',
                    url: "/Home/DeleteProduct",
                    dataType: 'json',
                    data: {
                        id: product.Id
                    },
                    success: function (products) {
                        window.PN.journal.products = products;
                        window.PN.AddProductDialog.setAutocomplit($('#new-edit-products-dialog #name').attr('value'));
                    }
                })
            }
        }
            
    },

    addBtnClick: function () {
        var value = $('#add-products-dialog #weight').attr('value');
        var prodName = $('#add-products-dialog #serch-product').attr('value');
        var product;

        var temp = value.indexOf(',');
        if (temp != '-1') {
            var temp = value.split(',');
            value = temp[0] + '.' + temp[1];
        }

        if (prodName.length == 0) {
            $('#add-products-dialog .validation-message').css('display', 'none');
            $('#add-products-dialog #product-empty-validation-message').css('display', 'block');
            return;
        }

        else {
            prods = window.PN.journal.products;
            var bool = false;
            for (var i = 0; i < prods.length; i++) {
                if (prods[i].Name == prodName) {
                    bool = true;
                    product = prods[i];
                }
            }
            if (!bool) {
                $('#add-products-dialog .validation-message').css('display', 'none');
                $('#add-products-dialog #product-notfound-validation-message').css('display', 'block');
                return;
            }
        }

        if (value.length == 0) {
            $('#add-products-dialog .validation-message').css('display', 'none');
            $('#add-products-dialog #value-empty-validation-message').css('display', 'block');
            return;
        }

        else if (isNaN(parseFloat(value))) {
            $('#add-products-dialog .validation-message').css('display', 'none');
            $('#add-products-dialog #value-isnumber-validation-message').css('display', 'block');
            return;
        }

        window.PN.AddProductDialog.addMeal(product, value);

        $(this).dialog('close');
    },

    addMeal: function (product, weight) {
        var date = new Date(window.PN.journal.journalMenu.date);
        date.setHours(window.PN.journal.journalBody.currentHour);

        $.ajax({
            type: 'POST',
            url: "/Home/AddMeal",
            dataType: 'json',
            data: {
                productId: product.Id,
                weight: weight,
                date: date
            },
            success: function () {

                $.ajax({
                    type: 'POST',
                    url: "/Home/GetMealsByDate",
                    dataType: 'json',
                    data: {
                        date: date
                    },
                    success: function (meals) {
                        window.PN.journal.foods = meals;
                        window.PN.journal.redrawProductDialog(window.PN.journal.journalBody.currentHour);
                    }
                });
            }
        })
    }
}

window.PN.NewEditProductDialog = {

    openDialog: function (state, product) {
        window.PN.NewEditProductDialog.clearDialog();

        var title;

        if (state == 'edit') {
            if (product == undefined) return;
            else {
                window.PN.NewEditProductDialog.product = product;
                title = 'Edit Product';
                window.PN.NewEditProductDialog.setFields();
            }
        }
        else if (state == 'new') {
            title = 'New Product';
            $('#new-edit-products-dialog #name').attr('value', $('#add-products-dialog #serch-product').val());
            var measures = window.PN.journal.measures;
            for (var i = 0; i < measures.length; i++) {
                if (i == 0) {
                    $('#new-edit-products-dialog #measure').append('<option selected="selected">' + measures[i].MeasUnit + '</option>');
                }
                else $('#new-edit-products-dialog #measure').append('<option>' + measures[i].MeasUnit + '</option>');
            }
        }
        else return;

        window.PN.NewEditProductDialog.state = state;

        $("#new-edit-products-dialog").dialog({
            title: title,
            modal: true,
            resizable: false,
            width: "auto",
            buttons: {
                Ok: function () {
                    if (window.PN.NewEditProductDialog.okBtnClick())
                        $(this).dialog('close');
                },
                Cancel: function () {
                    $(this).dialog('close');
                }
            }
        })
    },

    setFields: function () {
        product = window.PN.NewEditProductDialog.product;
        $('#new-edit-products-dialog #name').attr('value', product.Name);
        $('#new-edit-products-dialog #calories').attr('value', product.Calories);
        $('#new-edit-products-dialog #proteins').attr('value', product.Protein);
        $('#new-edit-products-dialog #fats').attr('value', product.Fat);
        $('#new-edit-products-dialog #carbohydrates').attr('value', product.Carbohydrates);

        var measures = window.PN.journal.measures;
        for (var i = 0; i < measures.length; i++) {
            if (product.MeasureUnitId == measures[i].Id) {
                $('#new-edit-products-dialog #measure').append('<option selected="selected">' + measures[i].MeasUnit + '</option>');
            }
            else $('#new-edit-products-dialog #measure').append('<option>' + measures[i].MeasUnit + '</option>');
        }
    },

    okBtnClick: function () {
        if (window.PN.NewEditProductDialog.validateFields()) {
            if (window.PN.NewEditProductDialog.state == 'new') {
                window.PN.NewEditProductDialog.ajaxAddProduct();
                return true;
            }
            else if (window.PN.NewEditProductDialog.state == 'edit') {
                window.PN.NewEditProductDialog.ajaxEditProduct();
                return true;
            }
        }
        return false;
    },

    validateFields: function () {
        var valid = true;
        var name = $('#new-edit-products-dialog #name').attr('value');
        var calories = $('#new-edit-products-dialog #calories').attr('value');
        var proteins = $('#new-edit-products-dialog #proteins').attr('value');
        var fats = $('#new-edit-products-dialog #fats').attr('value');
        var carboh = $('#new-edit-products-dialog #carbohydrates').attr('value');

        $('#new-edit-products-dialog .validation-message').css('display', 'none');
        if (name.length == 0) {
            $('#new-edit-products-dialog #name-empty-validation-message').css('display', 'block');
            valid = false;
        }

        window.PN.NewEditProductDialog.product;
        prodsArr = window.PN.journal.products;
        for (var i = 0; i < prodsArr.length; i++) {
            if (window.PN.NewEditProductDialog.state == 'edit') {
                if (name == window.PN.NewEditProductDialog.product.Name) continue;
            }
            if (prodsArr[i].Name == name) {
                $('#new-edit-products-dialog #name-isbusy-validation-message').css('display', 'block');
                valid = false;
            }
        }

        calories = window.PN.NewEditProductDialog.strToDigit(calories);
        if (calories.length == 0) {
            $('#new-edit-products-dialog #calories-empty-validation-message').css('display', 'block');
            valid = false;
        }
        else if (isNaN(parseFloat(calories))) {
            $('#new-edit-products-dialog #calories-isnumber-validation-message').css('display', 'block');
            valid = false;
        }

        proteins = window.PN.NewEditProductDialog.strToDigit(proteins);
        if (proteins.length == 0) {
            $('#new-edit-products-dialog #proteins-empty-validation-message').css('display', 'block');
            valid = false;
        }
        else if (isNaN(parseFloat(proteins))) {
            $('#new-edit-products-dialog #proteins-isnumber-validation-message').css('display', 'block');
            valid = false;
        }

        fats = window.PN.NewEditProductDialog.strToDigit(fats);
        if (fats.length == 0) {
            $('#new-edit-products-dialog #fats-empty-validation-message').css('display', 'block');
            valid = false;
        }
        else if (isNaN(parseFloat(fats))) {
            $('#new-edit-products-dialog #fats-isnumber-validation-message').css('display', 'block');
            valid = false;
        }

        carboh = window.PN.NewEditProductDialog.strToDigit(carboh);
        if (carboh.length == 0) {
            $('#new-edit-products-dialog #carbohydrates-empty-validation-message').css('display', 'block');
            valid = false;
        }
        else if (isNaN(parseFloat(carboh))) {
            $('#new-edit-products-dialog #carbohydrates-isnumber-validation-message').css('display', 'block');
            valid = false;
        }
        return valid;
    },

    strToDigit: function (value) {
        var temp = value.indexOf(',');
        if (temp != '-1') {
            var temp = value.split(',');
            value = temp[0] + '.' + temp[1];
        }
        return value;
    },

    clearDialog: function () {
        $('#new-edit-products-dialog .validation-message').css('display', 'none');
        $('#new-edit-products-dialog input').attr('value', '');
        $('#new-edit-products-dialog #measure').empty();
    },

    ajaxAddProduct: function () {
        var name = $('#new-edit-products-dialog #name').attr('value');
        var calories = $('#new-edit-products-dialog #calories').attr('value');
        var proteins = $('#new-edit-products-dialog #proteins').attr('value');
        var fats = $('#new-edit-products-dialog #fats').attr('value');
        var carboh = $('#new-edit-products-dialog #carbohydrates').attr('value');
        var measure = $('#new-edit-products-dialog #measure').attr('value');

        var measureArr = window.PN.journal.measures;
        var measureId;

        for (var i = 0; i < measureArr.length; i++) {
            if (measureArr[i].MeasUnit == measure) {
                measureId = measureArr[i].Id;
                break;
            }
        }

        $.ajax({
            type: 'POST',
            url: "/Home/AddProduct",
            dataType: 'json',
            data: {
                name: name,
                calories: calories,
                proteins: proteins,
                fats: fats,
                carbohydrates: carboh,
                measureId: measureId
            },
            success: function (products) {
                window.PN.journal.products = products;
                window.PN.AddProductDialog.setAutocomplit($('#new-edit-products-dialog #name').attr('value'));
            }
        });
    },

    ajaxEditProduct: function () {
        var name = $('#new-edit-products-dialog #name').attr('value');
        var calories = $('#new-edit-products-dialog #calories').attr('value');
        var proteins = $('#new-edit-products-dialog #proteins').attr('value');
        var fats = $('#new-edit-products-dialog #fats').attr('value');
        var carboh = $('#new-edit-products-dialog #carbohydrates').attr('value');
        var measure = $('#new-edit-products-dialog #measure').attr('value');

        var measureArr = window.PN.journal.measures;
        var measureId;

        for (var i = 0; i < measureArr.length; i++) {
            if (measureArr[i].MeasUnit == measure) {
                measureId = measureArr[i].Id;
                break;
            }
        }

        $.ajax({
            type: 'POST',
            url: "/Home/EditProduct",
            dataType: 'json',
            data: {
                id: window.PN.NewEditProductDialog.product.Id,
                name: name,
                calories: calories,
                proteins: proteins,
                fats: fats,
                carbohydrates: carboh,
                measureId: measureId
            },
            success: function (products) {
                window.PN.journal.products = products;
                window.PN.AddProductDialog.setAutocomplit($('#new-edit-products-dialog #name').attr('value'));
            }
        });
    }
}