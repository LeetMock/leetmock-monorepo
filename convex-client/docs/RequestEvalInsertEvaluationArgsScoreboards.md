# RequestEvalInsertEvaluationArgsScoreboards


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**communication** | [**RequestEvalInsertEvaluationArgsScoreboardsCommunication**](RequestEvalInsertEvaluationArgsScoreboardsCommunication.md) |  | 
**problem_solving** | [**RequestEvalInsertEvaluationArgsScoreboardsProblemSolving**](RequestEvalInsertEvaluationArgsScoreboardsProblemSolving.md) |  | 
**technical_competency** | [**RequestEvalInsertEvaluationArgsScoreboardsTechnicalCompetency**](RequestEvalInsertEvaluationArgsScoreboardsTechnicalCompetency.md) |  | 
**testing** | [**RequestEvalInsertEvaluationArgsScoreboardsTesting**](RequestEvalInsertEvaluationArgsScoreboardsTesting.md) |  | 

## Example

```python
from convex_client.models.request_eval_insert_evaluation_args_scoreboards import RequestEvalInsertEvaluationArgsScoreboards

# TODO update the JSON string below
json = "{}"
# create an instance of RequestEvalInsertEvaluationArgsScoreboards from a JSON string
request_eval_insert_evaluation_args_scoreboards_instance = RequestEvalInsertEvaluationArgsScoreboards.from_json(json)
# print the JSON string representation of the object
print(RequestEvalInsertEvaluationArgsScoreboards.to_json())

# convert the object into a dict
request_eval_insert_evaluation_args_scoreboards_dict = request_eval_insert_evaluation_args_scoreboards_instance.to_dict()
# create an instance of RequestEvalInsertEvaluationArgsScoreboards from a dict
request_eval_insert_evaluation_args_scoreboards_from_dict = RequestEvalInsertEvaluationArgsScoreboards.from_dict(request_eval_insert_evaluation_args_scoreboards_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


