#!/usr/bin/env python

# Copyright 2012 Allen Institute for Brain Science
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# This script downloads adult mouse brain coronal gene expression data sets and
# estimates how similar brain structures are according to their expression
# profile.

import numpy as np
import json
import sys
import os
import urllib
import string

# Global variables defining the path to the API and IDs of the ontology, 
# structure graph, product, and plane of sectioning of interest.  This script
# also provides the option of only estimating connections between a specific
# set of structures using the StructureSets table.  Only the `TOP_N` most 
# correlated connections will be kept, approximately.

# python -m SimpleHTTPServer to use the application locally (web browser too
# restrictif on security otherwise)

API_PATH = "http://api.brain-map.org/api/v2/data"
#API_PATH = "http://ibs-davidf-ux1:3000/api/v2/data"
#GRAPH_ID = 1 # ontology id
#MOUSE_PRODUCT_ID = 1 # aba
N_PROBES = 20

# Product id can be found in http://api.brain-map.org/api/v2/data/Product/query.xml
HUMAN_BRAIN_MA_PRODUCT_ID = 2
# ontology id can be found in :
# http://api.brain-map.org/api/v2/data/query.xml? \+
#criteria=model::Ontology,rma::criteria,[name$ilHuman%20Brain%20Atlas],
HUMAN_BRAIN_ATLAS_ONT_ID = 7

# query for all the human probes:
# http://api.brain-map.org/api/v2/data/query.xml?criteria=service::human_microarray_expression[probes$eq1053219][donor$eq10021]

# query to get a donnor id :
# http://api.brain-map.org/api/v2/data/query.xml?criteria=model::Donor,rma::criteria,[name$eqH0351.2002],
# H0351.2002 was found by searching for donnor

# http://api.brain-map.org/examples/rma_builder/rma_builder.html

# get all probes - # http://api.brain-map.org/api/v2/data/Probe/query.xml?criteria=[probe_type$eq'DNA'],products[abbreviation$eq'HumanMA']

# but cant get them all in one go - need to page

# http://api.brain-map.org/api/v2/data/Probe/query.xml?criteria=[probe_type$eq'DNA'],products[abbreviation$eq'HumanMA'],rma::options[start_rows$eq0],rma::options[num_rows$eq2000]

#

TOP_N = 2500

PROBE_ID_QUERY_URL_specif_rows = ("%s/Probe/query.json?criteria=[probe_type$eq'DNA']" +\
                         ",products[abbreviation$eq'HumanMA']" +\
                         ",rma::options[start_rows$eq0]" +\
                         ",rma::options[num_rows$eq2000]") % (API_PATH)

PROBE_ID_QUERY_URL = ("%s/Probe/query.json?criteria=[probe_type$eq'DNA']" +\
                        ",products[abbreviation$eq'HumanMA']") % (API_PATH)


URL_EXPRESS = ("http://api.brain-map.org/api/v2/data/query.json?" +\
                        "criteria=service::human_microarray_expression[donor$eq10021]")

def Get_HBA_StructureGraph(ontolog_id):
    """ example : id_of_graph =  Get_HBA_Ontology(7) (if 7 is the ontology id)
    """
    graph_url = "http://api.brain-map.org/api/v2/data/query.json?" +\
        "criteria=model::StructureGraph," +\
        "rma::criteria,ontology[id$eq%d]" % (ontolog_id)
    source = urllib.urlopen(graph_url).read()
    response = json.loads(source)
    return(response['msg'][0]['id'])


# get the human brain ontology
def Get_HBA_Ontology(ontology_key):
    """ example : id =  Get_HBA_Ontology('id')
    """
    url = "http://api.brain-map.org/api/v2/data/query.json?" +\
            "criteria=model::Ontology,rma::criteria,[abbreviation$ilhuman]"
    source = urllib.urlopen(url).read()
    response = json.loads(source)
    return(response['msg'][0][ontology_key])


structure_id = Get_HBA_StructureGraph(Get_HBA_Ontology('id'))
STRUCTURES_URL = ("%s/Structure/query.json?" +\
                      "criteria=[graph_id$eq%d]") % (API_PATH,structure_id)

def OneQueryAPI(url):
    source = source = urllib.urlopen(url).read()
    response = json.loads(source)
    return(response['msg'][0])

# Make a query to the API via a URL.
def QueryAPI(url,total_rows=-1):
    start_row = 0
    if total_rows > 0 and total_rows < 2000:
        num_rows = total_rows
    else:
        num_rows = 2000
    rows = []
    done = False

    # The ontology has to be downloaded in pages, since the API will not return
    # more than 2000 rows at once.
    while not done:
        pagedUrl = url + '&start_row=%d&num_rows=%d' % (start_row,num_rows)

        print pagedUrl
        source = urllib.urlopen(pagedUrl).read()
        response = json.loads(source)

        rows += response['msg']

        if total_rows < 0:
            total_rows = int(response['total_rows'])

        start_row += len(response['msg'])

        if start_row >= total_rows:
            done = True

    return rows

def GetExpressionData(probes_rows):
# get the expression data from the probe
#
    # get the number of sample using the first probe
    expressUrl = (URL_EXPRESS + "[probes$eq%d]") % probes_rows[0]['id']
    # resp = QueryAPI(expressUrl)
    source = urllib.urlopen(expressUrl).read()
    resp = json.loads(source)

    sampleNb = len(resp['msg']['samples'])
    probesNb = len(probes_rows)

    expression = np.empty([sampleNb,probesNb])
    expression.fill(np.nan)

    # get the expression for each probe
    for i,probe in enumerate(probes_rows):
        probe_id = probe['id']
        print "probe_id %s %d / %d" % (probe_id,i,probesNb)
        expressUrl = (URL_EXPRESS + "[probes$eq%d]") % probe_id
        # print expressUrl
        source = urllib.urlopen(expressUrl).read()
        response = json.loads(source)
        data = response['msg']['probes'][0]['expression_level']
        expression[:,i] = np.asarray(data)

    return(expression)

# Download the human brain structures in a structure graph.
def DownloadStructures():
    structs = QueryAPI(STRUCTURES_URL)

    # Build a dict from structure id to structure and identify each node's
    # direct descendants.
    structHash = {}
    for s in structs:
        s['num_children'] = 0
        s['structure_id_path'] = \
                [int(sid) for sid in s['structure_id_path'].split('/') if sid != '']
        structHash[s['id']] = s

    for sid,s in structHash.iteritems():
        if len(s['structure_id_path']) > 1:
            parentId = s['structure_id_path'][-2]
            structHash[parentId]['num_children'] += 1

    # pull out the structure ids for structures in this structure graph that
    # have no children (i.e. just the leaves)
    corrStructIds = [sid for sid,s in structHash.iteritems() if s['num_children'] == 0]

    return sorted(corrStructIds), structHash

# Download all of the probes, structures, and expression data for the human
# brain and transform it into useful data structures. Then compute
# structure-to-structure expression correlation for all structures.

def DownloadAndCorrelateData(n_probes=N_PROBES):
    structureIds, structHash = DownloadStructures()
    probes = QueryAPI(PROBE_ID_QUERY_URL,n_probes)
    expression = GetExpressionData(probes)
#    mdat = np.ma.masked_array(expression,np.isnan(expression))
#    corr = np.ma.corrcoef(mdat)
    corr = np.corrcoef(expression)
    return corr, structureIds, structHash # return corr.data, the buffer of corr?

# Given a structures-by-probes correlation matrix and an array of structures,
# figure out which structures are the most correlated to each other.  Return
# these as an array of {source,target,correlation} hashes.

def EstimateConnections(corr,structIds):
    """ Estimate the connections from array corr and strucIds
        Identify a threshold that will pull out approximately `TOP_N` values. 
        For the Human data, there doesnt seem to be a need for masking out the 
        NaNs (but the lower diagonal elements should be removed), then sort
        the values into a 1D array without masked elements.  The threshold will
        be picked as the value of the (length - TOP_N)'th element.

    Parameters:
    -----------
    corr: numpy array or array data buffer?,
        array filled with the correlation between structures

    structIds: list,
        from the DownloadStructures()
"""

    corrtril = np.tril(corr,-1)
    corrsort = np.sort(corrtril[corrtril.nonzero()])

    ncorr = len(corrsort)

    idx = ncorr-TOP_N if ncorr > TOP_N else 0
    threshold = corrsort[idx]

    connections = []
    nstructs = len(structIds)
    for i in xrange(nstructs):
        for j in xrange(i+1,nstructs):
            c = corr[i][j]
            if c > threshold:
                connections.append({ 'source': structIds[i],
                                     'target':  structIds[j],
                                     'corr' : corr[i][j] })

    return connections

# Handle command line arguments. Usage is:
# `download_data.py <prefix>.json <nprobes>`

nargs = len(sys.argv)

fname = sys.argv[1] if nargs > 1 else "out.json"
n = int(sys.argv[2]) if nargs > 2 else N_PROBES

base,ext = os.path.splitext(fname)

structfile = base + ".structures" + ext
connfile = base + ".connections" + ext
corrfile = base + ".correlations" + ext

# Download the data, compute the structure-structure correlation matrix, then
# identify the most correlated pairs of structures.
corr,structIds,structHash = DownloadAndCorrelateData(n_probes=n)
conns = EstimateConnections(corr,structIds)

# Write out the connections, structures, and correlation matrix as JSON.
if ext == ".json":
    f = open(connfile,"w")
    f.write(json.dumps(conns))
    f.close()

    f = open(structfile,"w")
    f.write(json.dumps(structHash.values()))
    f.close()

    f = open(corrfile,"w")
    f.write(json.dumps(list([list(r) for r in corr])))
    f.close()
else:
    print "output file: " + fname + " must be .json"

