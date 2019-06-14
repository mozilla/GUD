import { writable, derived } from 'svelte/store'
import queryString, { queryStringWithoutLocalOpts, queryParameters } from './query'
import options from './options.json'

const start = options.startOptions.setter;
const end = options.endOptions.setter;

import {fetchExploreData} from './fetchData'

const cacheObj = writable({})

export const queryIsCached = derived([queryString, queryStringWithoutLocalOpts, cacheObj], ([_, $q, $cacheObj]) => {
    // this requires looking at the entire queryString to see if anything has changed,
    // though we will by default want to only use queryStringWithoutLocalOpts for the cache check.
    // hence the _.
    if (!($q in $cacheObj)) return false;
    else return true;
})

const removeLocalParams = (obj) => {
    const toRemove = Object.keys(obj).filter(f => {
        return Object.keys(options).filter(opt => options[opt].onlyLocal).map(opt=>options[opt].key).includes(f)
    })

    toRemove.forEach(r=>delete obj[r])
}

const cacheOrFetch = derived([cacheObj, queryIsCached, queryStringWithoutLocalOpts, queryParameters], async ([$cacheObj, $isCached, $q, $qp, ]) => {
    if ($qp.mode !== 'explore') return undefined;
    if (!$isCached) {
        // save the fetch request here.
        const query = Object.assign({}, $qp)
        removeLocalParams(query)
        $cacheObj[$q] = fetchExploreData(query);
    }
    return $cacheObj[$q]
})

const dataset = derived([cacheOrFetch, start, end], async ([$data, $start, $end])=> {
    const data = await $data
    if (!data) return []
    return data.filter(d => { 
        return ($start !== '' ? d.date >= new Date($start ): true) && ($end !== '' ? d.date <= new Date($end) : true)
    }).map(d => {
        return Object.assign({}, d)
    })
})

export default dataset