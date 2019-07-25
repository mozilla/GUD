
function erfinv(x){
    var z;
    var a  = 0.147;
    var the_sign_of_x;
    if(0==x) {
        the_sign_of_x = 0;
    } else if(x>0){
        the_sign_of_x = 1;
    } else {
        the_sign_of_x = -1;
    }

    if(0 != x) {
        var ln_1minus_x_sqrd = Math.log(1-x*x);
        var ln_1minusxx_by_a = ln_1minus_x_sqrd / a;
        var ln_1minusxx_by_2 = ln_1minus_x_sqrd / 2;
        var ln_etc_by2_plus2 = ln_1minusxx_by_2 + (2/(Math.PI * a));
        var first_sqrt = Math.sqrt((ln_etc_by2_plus2*ln_etc_by2_plus2)-ln_1minusxx_by_a);
        var second_sqrt = Math.sqrt(first_sqrt - ln_etc_by2_plus2);
        z = second_sqrt * the_sign_of_x;
    } else { // x is zero
        z = 0;
    }
    return z;
}

function jackknife_resamples(arr) {
    const output = [];
    for (var i = 0; i < arr.length; i++) {
        var x = arr.slice();
        x.splice(i, 1);
        output.push(x);
    }
    return output;
}

function array_sum(arr) {
    return arr.reduce(function (acc, x) {
        return acc + x;
    }, 0);
}

function array_avg(arr) {
    return array_sum(arr) / arr.length;
}

function sumBucketsWithCI(counts_per_bucket, agg='sum') {
    //counts_per_bucket = counts_per_bucket.map(x => parseInt(x));
    var n = counts_per_bucket.length;
    var total = array_sum(counts_per_bucket);
    var mean = total / n;
    var resamples = jackknife_resamples(counts_per_bucket);
    var jk_means = resamples.map(x => array_avg(x));
    var mean_errs = jk_means.map(x => Math.pow(x - mean, 2));
    var bucket_std_err = Math.sqrt((n-1) * array_avg(mean_errs));
    var std_err = (agg === 'sum' ? n : 1) * bucket_std_err;
    // var z_score = Math.sqrt(2.0) * erfinv(0.90);
    var z_score = Math.sqrt(2.0) * erfinv(0.95);
    // shouldn't these be mean?
    let value;
    if (agg === 'sum') value = total;
    else if (agg === 'mean') value = mean;
    var high = z_score * std_err;
    var low = z_score * std_err;
    return {
        value,
        sum: total,
        low: low,
        high: high,
        margin: z_score * std_err,
        "pm": high - total,
        "nbuckets": n,
        mean
    };
}

export default sumBucketsWithCI