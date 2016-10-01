
var margin = {
        left: 0,
        top: 0,
        right: 10,
        bottom: 10
    },
    /*width = $("#new_flashcontent").parent().width(),
    height = $("#new_flashcontent").parent().height(),*/

    width = 1400,
    height = 790,

    bg_width = 2462,
    bg_height = 1005,
    ratio_init = width / bg_width;




var zoom = d3.behavior.zoom()
    .scaleExtent([ratio_init, 3])
    .on("zoom", zoomed);

var drag = d3.behavior.drag()
    .origin(function(d) {
        return d;
    })
    .on("dragstart", dragstarted)
    .on("drag", dragged)
    .on("dragend", dragended);

var _svg = d3.select("#new_flashcontent").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom)
     ;


// 总容器
var container = _svg.append("g");
container
    .attr("class", "all")
    .append("image")
    .attr("xlink:href", "images/bg.png")
    .attr("x", "0")
    .attr("y", "0")
    .attr("width", bg_width)
    .attr("height", bg_height)
    ;



// 生成左侧面板数据
$.each(arrSort, function(index, val) {
     $('ul.sort').append(
        "<li class='sort" +index+ "'>" +
        "<img src='images/icon/s" + index + ".png' class='picture'>" +
        "<h2>" + val.textTitle +"</h2>" +
        "</li>"
        );
});

// 放置位置点的集合
var container_dots = container.append("g").attr("class", "dots");


// 所有点定义

// 负值绝对值越大 越向下
    var offset_x = 0, offset_y = 0;
    var RECT_W = 20,RECT_H = 20;
    // var LINE_H = 22;

$.each(arr, function(index, val) {

    var container_ci = container_dots.append("g")
        .attr("class", "ci ci"+index+" sort"+val.sort);


    // 杆部
    if(val.line!= ""){
         container_ci
         .append("image")
         .attr("xlink:href", "images/icon/" + val.line)
         .attr("x", val.x-RECT_W/2+offset_x )
         .attr("y", val.y-val.line_h+3+offset_y )
         .attr("width", RECT_W)
         .attr("height", val.line_h)
         ;
     }
    // 定位小园点
    container_ci.append("circle").attr("cx", val.x+offset_x).attr("cy", val.y+offset_y);

    // 方形图
    var _pic;
    if(val.pic!=null){ 
        _pic="images/icon/"+val.pic;
    }
    else{
        _pic="images/icon/s" + val.sort + ".png";
    }

    container_ci
        .append("image")
        .attr("xlink:href", _pic )
        .attr("id", index)
        .attr("x", val.x-RECT_W/2+offset_x )
        .attr("y", val.y-RECT_H+4+offset_y- val.line_h )
        .attr("width", RECT_W)
        .attr("height", RECT_H)
       ;

       

    // 坐标点上的点击区
    container_ci
        .append("rect")
        .attr("id", val.sort)
        .attr("x", val.x-RECT_W/2+offset_x)
        .attr("y", val.y-RECT_H-val.line_h+4+offset_y)
        .attr("width", RECT_W)
        .attr("height", RECT_H)
        .on("click", function(e) {
            var _id = this.id;
            $('.svg_pop .tit').text( arrSort[_id].textTitle );
            $('.svg_pop .Nounsexplain').html( arrSort[_id].Nounsexplain );
            $('.svg_pop .Area').html( arrSort[_id].Area );

            // note注意事项有判断，如果点上有值，就使用点上值，如果没有值，就使用分类sort中的值
            $('.svg_pop .Note').html( arr[index].note? arr[index].note : arrSort[_id].Note );
            $('.svg_pop .picture').html( "<img src='images/icon/pic"+_id+".jpg'/>" );

            $('.svg_pop').slideDown('200');
        })
        .on("mouseover", function(e) {
            TweenMax.to($(this).prev(), .2, 
            {
                scale: "1.3",transformOrigin:"center center",repeat: 3, yoyo: true
            });
        })
        .on("mouseout", function(e) {
            TweenMax.to($(this).prev(), .1, { scale: "1",transformOrigin:"center center"});
        }) ;
});

// 将画布调整到起始比率
zoom.scale(ratio_init);
zoom.event(_svg.transition().duration(200));


function dottype(d) {
    d.x = +d.x;
    d.y = +d.y;
    d.id = +d.id;
    return d;
}

function zoomed() {
    $('.tip i').text((d3.event.scale).toFixed(2));
    container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
}

function dragged(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}

function dragended(d) {
    d3.select(this).classed("dragging", false);

}

// 分类面板
$('.sort li').click(function(event) {
    var _li = $(this).attr("class");
    var obj = $("svg ." + _li + " image");
    TweenMax.to(obj, .1, {
        y: "+=-13",
        repeat: 5,
        yoyo: true
    });
});

// 分类面板收缩
$('.side').click(function(event) {
    if($('.panel').hasClass('active'))
        {$('.panel').removeClass('active')}
    else{
        {$('.panel').addClass('active')}
    }
});

// 弹窗
$('.svg_pop i').click(function(event) {
    $('.svg_pop').slideUp().children('span').text("");
});

// 隐藏调试点
/*$('.arr').click(function(event) {
    $('circle').css('fill', 'rgba(0, 2, 255, 1)');
});*/

// 右上角的比例显示
$('.tip i').text(ratio_init.toFixed(2));

// 变尺寸 
var _box = $(".box1");
$('.quanp').click(function(event) {

    _box.addClass('fullscreen');
    $('.cont').css('position', 'static');
    _w = $(window).innerWidth();
    _h = $(window).innerHeight();

    TweenMax.to( $('.box1'),0,{width:_w,height:_h,
            onComplete:function(){
                    box_resize(_w,_h);
                }})
});

$('.quanp_inner').click(function(event) {

    _box.removeClass('fullscreen');
     $('.cont').css('position', 'absolute');
    _w = 1406;
    _h = 700;
    
    TweenMax.to( $('.box1'),0,{width:_w,height:_h,
        onComplete:function(){
                box_resize(_w,_h);
            }})
});

function box_resize(width,height) {
    

    // 变换画布
    ratio_init = width / 2105;
    
    // 改变画布尺寸
    TweenMax.to($('svg'),.3,{width:width,height:height});

    // 改变位移和比例
    zoom.translate([0,0]).scale(ratio_init);
    zoom.event(_svg.transition().duration(200));

}


